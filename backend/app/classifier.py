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
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
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


def _call_groq(prompt: str, system: str = SYSTEM_PROMPT) -> str:
    """Send a single prompt to Groq's hosted inference API and return the raw text response."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise GroqUnavailableError(
            "GROQ_API_KEY environment variable is not set. Get a free key at "
            "https://console.groq.com/keys and set it with: export GROQ_API_KEY=your_key_here "
            "(or add it to a .env file if you're using python-dotenv)."
        )

    max_retries = 3
    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.1,  # low temperature: consistency matters more than creativity here
                },
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
            if resp.status_code == 429 and attempt < max_retries:
                retry_after = 2.0 * (attempt + 1)
                time.sleep(retry_after)
                continue
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except requests.exceptions.ConnectionError as exc:
            raise GroqUnavailableError(
                "Could not reach Groq's API. Check your internet connection — "
                "this classifier now requires connectivity (see the offline/online "
                "trade-off note at the top of this file)."
            ) from exc
        except requests.exceptions.HTTPError as exc:
            details = ""
            try:
                details = f" Details: {resp.text}"
            except Exception:
                pass
            raise GroqUnavailableError(
                f"Groq API returned an error: {exc}.{details} Check that GROQ_API_KEY is valid "
                "and hasn't hit its rate limit."
            ) from exc


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


def classify_report(report_text: str) -> ClassificationResult:
    """
    Classify a single safety report as SIF-potential or routine.

    Raises:
        GroqUnavailableError: if the Groq API can't be reached, the API
            key is missing/invalid, or a rate limit is hit.
        ClassifierParseError: if the model's output can't be parsed as
            valid JSON even after one retry.
    """
    raw_output = _call_groq(report_text)

    try:
        parsed = _extract_json(raw_output)
    except (json.JSONDecodeError, AttributeError):
        # Retry once with a stricter instruction before giving up.
        retry_prompt = f"{RETRY_INSTRUCTION}\n\nOriginal report to classify:\n{report_text}"
        raw_output = _call_groq(retry_prompt)
        try:
            parsed = _extract_json(raw_output)
        except (json.JSONDecodeError, AttributeError) as exc:
            raise ClassifierParseError(
                f"Model output could not be parsed as JSON after retry. Last raw output:\n{raw_output}"
            ) from exc

    verdict = parsed.get("verdict", "").strip()
    if verdict not in ("SIF-potential", "routine"):
        raise ClassifierParseError(f"Model returned an unrecognised verdict value: {verdict!r}")

    confidence = float(parsed.get("confidence", 0.0))
    confidence = max(0.0, min(1.0, confidence))  # clamp defensively

    return ClassificationResult(
        verdict=verdict,
        confidence=confidence,
        reasoning=parsed.get("reasoning", "").strip(),
        raw_model_output=raw_output,
    )
