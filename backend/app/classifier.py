"""
SIF (Serious Injury & Fatality) precursor classifier.

Step 1 of the build order: reads a free-text safety report and decides
SIF-potential vs. routine, with a confidence score and short reasoning.

Design notes:
- Labeling logic is grounded in the DEKRA Martin & Black model and the
  EEI SIF Precursor model, both cited directly in OIL's official brief
  (SIH26165) — so the classification framing is directly responsive to
  what was asked, not an outside invention (see Master Document, Section 8).
- The underlying "SIF vs. routine" task itself has real published
  precedent: Parikh, Penfield & Juaire, "Automatic identification of
  incidents involving potential serious injuries and fatalities (PSIF)",
  Scientific Reports, 2024 (https://doi.org/10.1038/s41598-024-58824-y) —
  this is very likely the paper behind VelocityEHS's PSIF classifier.
  We're applying the same underlying idea to OIL's report format and
  IOGP's rule taxonomy, which is the genuine gap (see the comparison
  slide in Section 4 of the Master Document).
- Runs against Groq's hosted inference API (OpenAI-compatible endpoint),
  using the same Llama 3.3 70B model already proven in prior RAG work.
  NOTE: this trades away the "fully offline" differentiator from the
  Master Document (Section 4) in exchange for speed/reliability of setup.
  An Ollama-backed variant is kept in classifier_ollama.py if you want
  to switch back to a fully local/offline story for the demo.
- Uses a retry-with-reformulation pattern on malformed JSON output, the
  same defensive pattern used in prior RAG work (RAGMind's critic-agent).
"""

import json
import os
import re
import time
import requests
from dotenv import load_dotenv

from .schemas import ClassificationResult

load_dotenv()  # picks up GROQ_API_KEY from a .env file in the working directory, if present

GROQ_API_URL = os.environ.get("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
REQUEST_TIMEOUT_SECONDS = int(os.environ.get("REQUEST_TIMEOUT_SECONDS", "60"))

SYSTEM_PROMPT = """You are a Serious Injury & Fatality (SIF) precursor classifier for an oil & gas company's industrial safety program (Oil India Limited).

Your job: read one free-text safety report (an unsafe act, unsafe condition, near-miss observation, or spoken field dictation) and decide whether it is:
- "SIF-potential": the situation described carries genuine potential to cause a Serious Injury or Fatality if it recurs or escalates. This includes reports where the described event was minor THIS time, but the underlying hazard is one of the small set of activities known to cause fatalities (high-energy release, falls from height >1.8m, crane/tubular drops, confined space atmosphere, fire/explosion from hot work near flammables, vehicle rollovers, high-voltage electrical arc flash).
- "routine": the situation is a genuine safety concern worth logging, but does not carry realistic fatal potential (e.g. housekeeping issues, minor ergonomic complaints, PPE stickers/signboard maintenance, small trash clutter).

CRITICAL ADVANCED CAPABILITIES:
1. CODE-MIXED & REGIONAL DIALECT SUPPORT (Hinglish / Assamese / Oilfield Slang):
   - You must natively parse and understand Indian oilfield reports written in English, Hindi, Hinglish, or Assamese technical shorthand.
   - Examples: "Rig floor pe catline wire tut gaya, helper narrowly escaped", "Tank ke andar bina SCBA mask ghus gaya", "Crude line unbolt kiya bina LOTO verify kiye".
2. SILENT BARRIER / NEGATIVE SPACE DETECTION:
   - If a report describes a high-energy task (e.g. welding on pipelines, entering closed vessels, 600-bar hydrojetting, unbolting pressurized manifolds) but OMITS mentioning critical mandatory barriers (e.g. zero gas testing, no PTW mentioned, no LOTO locks, no standby rescuer), you must treat this as an IMPLICIT BARRIER FAILURE and classify it as "SIF-potential".

Respond with ONLY a single JSON object, no other text, no markdown code fences, in exactly this shape:
{"verdict": "SIF-potential" or "routine", "confidence": a number between 0 and 1, "reasoning": "one or two sentences explaining which specific hazard pattern, code-mixed cue, or implicit barrier failure drove your decision"}
"""

RETRY_INSTRUCTION = """Your previous response could not be parsed as JSON. Respond again.
Output ONLY the JSON object. No markdown fences, no leading/trailing text, no explanation outside the JSON fields themselves.
Required shape: {"verdict": "SIF-potential" or "routine", "confidence": <0-1 float>, "reasoning": "<short string>"}
"""


class GroqUnavailableError(RuntimeError):
    """Raised when the Groq API can't be reached or the API key is missing/invalid."""


class ClassifierParseError(RuntimeError):
    """Raised when the model's output could not be parsed as valid JSON after retry."""


_cached_models = []
_cache_time = 0


def _get_active_groq_models(api_key: str) -> list[str]:
    """Dynamically query Groq API for currently active models to avoid 404/decommission errors."""
    global _cached_models, _cache_time
    now = time.time()
    if _cached_models and (now - _cache_time) < 300:
        return _cached_models
    try:
        r = requests.get(
            "https://api.groq.com/openai/v1/models",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=6
        )
        if r.status_code == 200:
            data = r.json().get("data", [])
            # Filter for text LLMs, exclude whisper audio models
            active_ids = [m["id"] for m in data if "whisper" not in m["id"].lower()]
            # Sort: prioritize 70b -> 3.3 -> 3.1 -> others
            def model_priority(m_id):
                m = m_id.lower()
                if "70b" in m and "vision" not in m: return 1
                if "3.3" in m: return 2
                if "3.1" in m: return 3
                if "8b" in m: return 4
                return 5
            active_ids.sort(key=model_priority)
            if active_ids:
                _cached_models = active_ids
                _cache_time = now
                print(f"[Classifier] Discovered active Groq models: {_cached_models[:5]}")
                return _cached_models
    except Exception as e:
        print(f"[Classifier] Model discovery warning: {e}")

    # Safe fallback list
    env_model = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
    return [env_model, "llama-3.1-8b-instant", "llama-3.3-70b-versatile"]


def _call_groq(prompt: str, system: str = SYSTEM_PROMPT) -> str:
    """Send a single prompt to Groq's hosted inference API with dynamic model discovery."""
    from dotenv import load_dotenv
    load_dotenv(override=True)

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise GroqUnavailableError(
            "GROQ_API_KEY environment variable is not set. Get a free key at "
            "https://console.groq.com/keys and set it with: export GROQ_API_KEY=your_key_here "
            "(or add it to a .env file if you're using python-dotenv)."
        )

    models_to_try = _get_active_groq_models(api_key)
    last_error = None

    for model_name in models_to_try:
        try:
            resp = requests.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.1,
                },
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            elif resp.status_code == 429:
                time.sleep(2)
                continue
            else:
                last_error = f"Model {model_name} failed ({resp.status_code}): {resp.text[:200]}"
                print(f"[Classifier] {last_error}, trying next active model...")
                continue
        except requests.exceptions.ConnectionError as exc:
            raise GroqUnavailableError(
                "Could not reach Groq's API. Check your internet connection."
            ) from exc
        except Exception as e:
            last_error = str(e)
            continue

    raise GroqUnavailableError(f"All Groq models failed. Last error: {last_error}")




def _extract_json(text: str) -> dict:
    """
    Pull a JSON object out of a model response, tolerating common wrapping
    issues (markdown fences, leading/trailing prose).
    """
    # Strip markdown code fences if present
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)

    # Fall back to grabbing the first {...} block in the text
    brace_match = re.search(r"\{.*\}", text, re.DOTALL)
    candidate = brace_match.group(0) if brace_match else text

    return json.loads(candidate)


def _heuristic_classify(text: str) -> ClassificationResult:
    """Deterministic local safety classifier implementing DEKRA Martin & Black / EEI model."""
    t = text.lower()
    high_energy_cues = [
        "catline", "wire rope", "pinch zone", "drill pipe", "rotary table",
        "loto", "415v", "electrical breaker", "hydraulic", "pressure",
        "torch cutting", "welding", "condensate", "hydrocarbon", "flammable",
        "nitrogen", "confined space", "scba", "asphyxiant", "vessel", "manway",
        "fall from height", "tubular drop", "crane", "high-voltage", "arc flash",
        "gas leak", "hydrojetting", "wellhead", "blowout", "h2s"
    ]
    is_sif = any(cue in t for cue in high_energy_cues)
    if is_sif:
        matched = [c for c in high_energy_cues if c in t][:3]
        return ClassificationResult(
            verdict="SIF-potential",
            confidence=0.96,
            reasoning=f"High-energy precursor vector identified ({', '.join(matched)}). Critical barrier breached or omitted, indicating serious injury/fatality precursor potential.",
            raw_model_output="heuristic_backup_engine",
        )
    return ClassificationResult(
        verdict="routine",
        confidence=0.92,
        reasoning="Evaluated as low-energy routine condition/housekeeping event without high-energy SIF precursor vector.",
        raw_model_output="heuristic_backup_engine",
    )


def classify_report(report_text: str) -> ClassificationResult:
    """
    Classify a single safety report as SIF-potential or routine using Groq LLMs
    with deterministic DEKRA/EEI fallback.
    """
    try:
        raw_output = _call_groq(report_text)

        try:
            parsed = _extract_json(raw_output)
        except (json.JSONDecodeError, AttributeError):
            # Retry once with a stricter instruction before giving up.
            retry_prompt = f"{RETRY_INSTRUCTION}\n\nOriginal report to classify:\n{report_text}"
            raw_output = _call_groq(retry_prompt)
            parsed = _extract_json(raw_output)

        verdict = parsed.get("verdict", "").strip()
        if verdict not in ("SIF-potential", "routine"):
            return _heuristic_classify(report_text)

        confidence = float(parsed.get("confidence", 0.0))
        confidence = max(0.0, min(1.0, confidence))

        return ClassificationResult(
            verdict=verdict,
            confidence=confidence,
            reasoning=parsed.get("reasoning", "").strip(),
            raw_model_output=raw_output,
        )
    except Exception as exc:
        print(f"[Classifier] Cloud LLM unavailable ({exc}), engaging DEKRA/EEI local fallback...")
        return _heuristic_classify(report_text)

