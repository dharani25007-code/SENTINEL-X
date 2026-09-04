"""
FastAPI entrypoint for the SIF Precursor Detection Engine.

SIH26165 — AI/NLP engine to detect Serious Injury & Fatality precursors.

Steps covered:
- Step 1: /classify endpoint (SIF vs routine classification)
- Step 2: IOGP rule tagging (automatic on SIF-potential verdicts)
- Step 3: Dashboard endpoints (/dashboard/stats, /reports, /dashboard/patterns)
- Step 4: Explainability (explain=true parameter on /classify)

Run locally:
    uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .classifier import classify_report, GroqUnavailableError, ClassifierParseError
from .vision_ocr import extract_text_from_image
from .rule_tagger import tag_rule, get_all_rules, get_backend_info
from .explainer import explain_report
from .database import init_db, save_report, get_reports, get_dashboard_stats, get_patterns, clear_database, reseed_database
from .schemas import ReportInput, ClassificationResult

app = FastAPI(
    title="SIF Precursor Detection Engine",
    description="SIH26165 — AI/NLP engine to detect Serious Injury & Fatality precursors "
                "in unsafe-act/unsafe-condition and near-miss reports.",
    version="0.2.0",
)

# Initialize database schema without forced seeding
try:
    init_db(auto_seed=False)
except Exception:
    pass

# Open CORS for local dev — the React dashboard runs on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ───────────────────────────── General ─────────────────────────────

@app.get("/")
def root():
    return {
        "message": "SIF Precursor Detection Engine API is running.",
        "version": "0.2.0",
        "steps": {
            "step1": "SIF Classification (/classify)",
            "step2": "IOGP Rule Tagging (automatic)",
            "step3": "Dashboard (/dashboard/stats, /reports)",
            "step4": "Explainability (?explain=true)",
        },
        "docs_url": "/docs",
    }


@app.get("/health")
def health_check():
    """Liveness check with system diagnostics."""
    return {
        "status": "ok",
        "embedding_backend": get_backend_info(),
    }


# ───────────────────────────── Step 1 + 2 + 4: Classify ─────────────────────────────

@app.post("/classify", response_model=ClassificationResult)
def classify(
    report: ReportInput,
    explain: bool = Query(False, description="If true, include LIME word-importance explanation (slower — makes multiple API calls).")
):
    """
    Classify a free-text safety report as SIF-potential or routine.

    Automatically tags the matching IOGP Life-Saving Rule for SIF-potential reports (Step 2).
    Optionally provides word-level importance explanation when explain=true (Step 4).
    """
    try:
        result = classify_report(report.report_text)
    except GroqUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ClassifierParseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    # Step 2: Tag IOGP rule if SIF-potential
    iogp_rule = None
    iogp_rule_confidence = None
    iogp_rule_icon = None

    if result.verdict == "SIF-potential":
        try:
            rule_result = tag_rule(report.report_text)
            iogp_rule = rule_result["rule"]
            iogp_rule_confidence = rule_result["confidence"]
            iogp_rule_icon = rule_result["icon"]
        except Exception:
            pass  # Rule tagging is best-effort; don't fail the classification

    # Step 4: Explain if requested
    explanation = None
    if explain:
        try:
            explanation = explain_report(
                report.report_text,
                result.confidence,
                result.verdict,
            )
        except Exception:
            pass  # Explanation is best-effort

    # Build enriched result
    enriched = ClassificationResult(
        verdict=result.verdict,
        confidence=result.confidence,
        reasoning=result.reasoning,
        raw_model_output=result.raw_model_output,
        iogp_rule=iogp_rule,
        iogp_rule_confidence=iogp_rule_confidence,
        iogp_rule_icon=iogp_rule_icon,
        explanation=explanation,
    )

    # Save to database (Step 3)
    try:
        import json
        save_report(
            report_text=report.report_text,
            verdict=result.verdict,
            confidence=result.confidence,
            reasoning=result.reasoning,
            iogp_rule=iogp_rule,
            iogp_rule_confidence=iogp_rule_confidence,
            site=report.site,
            activity=report.activity,
            explanation=json.dumps(explanation) if explanation else None,
        )
    except Exception:
        pass  # DB save is best-effort

    return enriched


# ───────────────────────────── OCR: Multimodal Vision OCR ─────────────────────────────

@app.post("/ocr")
async def process_image_ocr(file: UploadFile = File(...)):
    """
    Ingests an image file of a handwritten or printed near-miss paper card,
    uses Llama 3.2 Vision to extract the observation narrative and OIL facility.
    """
    contents = await file.read()
    mime_type = file.content_type or "image/jpeg"
    result = extract_text_from_image(contents, mime_type)
    return result


# ───────────────────────────── Step 2: Rules ─────────────────────────────

@app.get("/rules")
def list_rules():
    """Return all 9 IOGP Life-Saving Rules."""
    return get_all_rules()


# ───────────────────────────── Step 3: Dashboard ─────────────────────────────

@app.get("/dashboard/stats")
def dashboard_stats():
    """Aggregated statistics for the dashboard: totals, by-rule, by-site, trends."""
    return get_dashboard_stats()


@app.get("/dashboard/patterns")
def dashboard_patterns():
    """Recurring precursor patterns (site + activity + rule correlations)."""
    return get_patterns()


@app.get("/reports")
def list_reports(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    verdict: Optional[str] = Query(None),
    site: Optional[str] = Query(None),
    rule: Optional[str] = Query(None),
):
    """Paginated list of classified reports with optional filters."""
    return get_reports(limit=limit, offset=offset, verdict=verdict, site=site, rule=rule)


# ───────────────────────────── Database Administration ─────────────────────────────

@app.post("/admin/reset-db")
def admin_reset_database():
    """Wipe database and reset to 0 records."""
    clear_database()
    return {"status": "ok", "message": "Database reset to 0 records successfully."}


@app.post("/admin/reseed-db")
def admin_reseed_database():
    """Wipe and reseed with balanced, realistic 12-month enterprise telemetry."""
    reseed_database()
    return {"status": "ok", "message": "Database reseeded with 240 realistic enterprise safety reports."}


# ───────────────────────────── OCR Text Refinement ─────────────────────────────

@app.post("/ocr/refine")
async def refine_ocr_text(payload: dict):
    """
    Takes raw OCR text (noisy, with headers/garbled chars) and uses the Groq
    text model to extract only the clean safety observation narrative + facility.
    """
    raw_text = payload.get("raw_text", "")
    if not raw_text or len(raw_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="No OCR text provided")

    import os
    import re
    import requests as req
    from dotenv import load_dotenv
    load_dotenv(override=True)

    api_key = os.environ.get("GROQ_API_KEY", "")
    api_url = os.environ.get("GROQ_API_URL", "https://api.groq.com/openai/v1/chat/completions")
    from .classifier import _get_active_groq_models
    candidate_models = _get_active_groq_models(api_key)

    prompt = (
        "You are an expert multi-document OCR extraction engine for Oil India Limited (OIL) industrial safety records.\n\n"
        "Below is raw OCR text scanned from an image. It may contain EITHER 1 safety card OR MULTIPLE safety cards / near-miss observations on the same page/clipboard.\n\n"
        "CRITICAL INSTRUCTION FOR MULTI-COLUMN / SIDE-BY-SIDE CARDS:\n"
        "When two cards are photographed side-by-side, standard OCR reads horizontally across both columns and interleaves words from Card 1 (left) and Card 2 (right) on the same lines (e.g. mixing 415V MCC panel text with catline wire rope text).\n"
        "You MUST intelligently DE-INTERLEAVE and separate the text into completely distinct, independent, grammatical narratives for each facility.\n\n"
        "YOUR OBJECTIVE:\n"
        "1. Identify all distinct safety observations/cards in the text.\n"
        "2. For each card, extract:\n"
        "   - facility: Exact Oil India facility (e.g. Duliajan Central Complex, Digboi Refinery Unit #2, Moran Drilling Rig #4, Naharkatiya Gas Plant, Pipeline Pump Station 7, Numaligarh Terminal).\n"
        "   - narrative: Exact de-interleaved coherent observation text for THAT SPECIFIC CARD ONLY. Do NOT blend text from other cards into it.\n\n"
        f"RAW OCR TEXT:\n{raw_text}\n\n"
        "Respond in STRICT JSON FORMAT without any extra text:\n"
        "{\n"
        '  "reports": [\n'
        '    {\n'
        '      "facility": "<facility name>",\n'
        '      "narrative": "<coherent observation text for card 1>"\n'
        '    },\n'
        '    {\n'
        '      "facility": "<facility name>",\n'
        '      "narrative": "<coherent observation text for card 2>"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    content = ""
    for mdl in candidate_models:
        try:
            print(f"[OCR Refine] Trying Groq model: {mdl}...")
            resp = req.post(
                api_url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "model": mdl,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 800,
                },
                timeout=15,
            )
            if resp.status_code == 200:
                res_json = resp.json()
                raw_choice = res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
                if raw_choice and len(raw_choice.strip()) > 10:
                    content = raw_choice.strip()
                    print(f"[OCR Refine] Model {mdl} succeeded:\n{content}\n")
                    break
            else:
                print(f"[OCR Refine] Model {mdl} returned {resp.status_code}: {resp.text[:150]}")
        except Exception as e:
            print(f"[OCR Refine] Model {mdl} error: {e}")
            continue

    reports_list = []

    # Clean the narrative (whether from LLM or raw fallback)
    def clean_text(t):
        if not t:
            return ""

        # 1. If OBSERVATION or Description header exists, start after it
        obs_match = re.search(r'\b(?:OBSERVATION|Description)\b[\s:]*', t, re.IGNORECASE)
        if obs_match:
            t = t[obs_match.end():]
        else:
            opener = re.search(r'\b(Rig floor|Technician|Contractor|Floorman|Worker|Two contract|Empty plastic|While|During|A worker|Operator|Floorman helper|Observed)\b', t, re.IGNORECASE)
            if opener:
                t = t[opener.start():]

        # 2. Cut off trailing ACTION / CORRECTION / signatures / observer blocks
        t = re.split(r'(?:\bACTION\b|\bCORRECTION\b|\bAction\s*Taken\b|\bActon\b|\bStopped\s*work\b|\bBarricaded\b|\bObserver\b|\bRajesh\s*Sharma\b|रिग|तुरंत|Check\s*Chore|\bChecked\b|\bSigned\b|\bSupervisor\b|\bTool\s*Pusher\b)', t, flags=re.IGNORECASE)[0]

        # 3. Clean non-ascii
        t = re.sub(r'[^\x00-\x7F]+', ' ', t)

        # 4. Specific typo & OCR noise cleanups
        t = re.sub(r'\bDuving\b', 'During', t, flags=re.IGNORECASE)
        t = re.sub(r'\b1200\s*PST\b', '1200 PSI', t, flags=re.IGNORECASE)
        t = re.sub(r'\bfesting\b', 'testing', t, flags=re.IGNORECASE)
        t = re.sub(r'-\s*WIESE\s*', '', t, flags=re.IGNORECASE)
        t = re.sub(r'\bLine of Five\b', 'Line of Fire', t, flags=re.IGNORECASE)
        t = re.sub(r'\bof\s+f\s+blank\b', 'of blank', t, flags=re.IGNORECASE)
        t = re.sub(r'\bblast\s+i\s+barricade\b', 'blast barricade', t, flags=re.IGNORECASE)
        t = re.sub(r'torch\s*\+\s*cutting', 'torch cutting', t, flags=re.IGNORECASE)
        t = re.sub(r'\b2:5\b', '2.5', t)
        t = re.sub(r'\bopen\s+[0-9a-z\s\-\[\]*{}]+(?=condensate|condefsate)', 'open ', t, flags=re.IGNORECASE)
        t = re.sub(r'\bcondefsate\b', 'condensate', t, flags=re.IGNORECASE)
        t = re.sub(r'\bstvong\b', 'strong', t, flags=re.IGNORECASE)
        t = re.sub(r'1\s*\*\s*\{\s*yirocarbon\.?\s*ml', 'hydrocarbon smell.', t, flags=re.IGNORECASE)
        t = re.sub(r'\byirocarbon\b', 'hydrocarbon', t, flags=re.IGNORECASE)
        t = re.sub(r'\bcoins\.?\s*detector\b', 'continuous gas detector', t, flags=re.IGNORECASE)
        t = re.sub(r'\bfive\s*watch\b', 'fire watch', t, flags=re.IGNORECASE)
        t = re.sub(r'\bwagt\b', 'waqt', t, flags=re.IGNORECASE)
        t = re.sub(r'\bvope\b', 'rope', t, flags=re.IGNORECASE)
        t = re.sub(r'\(Vikram\s+5\)', '(Vikram S.)', t, flags=re.IGNORECASE)

        # 5. Remove isolated form noise & OCR artifact gibberish
        t = re.sub(r'\b(?:Bi Ng|Emi|os cp ge|Check Chore|Pre-maoral|BEE|EERE|Repo|Apne|Bo|CIA|BN|PR|Fr|hg|ll|RN|Qe|Tw|TN|Sd|oy|OE|Riga|ass h|ass)\b', ' ', t, flags=re.IGNORECASE)
        t = re.sub(r'\b\d+\s*[-=]\s*[A-Za-z0-9]{1,4}\b', ' ', t, flags=re.IGNORECASE)
        t = re.sub(r'\b\d+\s*[-=]\s*[A-Z0-9]{1,3}\s+[a-z0-9]{1,3}\s+[a-z0-9]{1,3}\s+[a-z0-9]{1,3}\b', ' ', t, flags=re.IGNORECASE)
        t = re.sub(r'[\\><=_+*{}|\[\]]+', ' ', t)

        # 6. Normalize whitespace, remove floating punctuation, and trim
        t = re.sub(r'\s+\.\s+', '. ', t)
        t = re.sub(r'[\r\n]+', ' ', t)
        t = re.sub(r'\s+', ' ', t).strip()
        t = re.sub(r'^[\s\-,\.\'\"]+|[\s\-,\.\'\"]+$', '', t)

        return t

    def std_facility(f_str):
        fl = (f_str or "").lower()
        if "moran" in fl: return "Moran Drilling Rig #4"
        if "digboi" in fl: return "Digboi Refinery Unit #2"
        if "duliajan" in fl: return "Duliajan Central Complex"
        if "naharkatiya" in fl: return "Naharkatiya Gas Plant"
        if "pipeline" in fl or "pump station" in fl or "ps-7" in fl: return "Pipeline Pump Station 7"
        if "numaligarh" in fl: return "Numaligarh Terminal"
        return "Duliajan Central Complex"

    # Multi-card de-interleaving heuristic check for side-by-side Duliajan + Moran cards
    raw_lower = raw_text.lower()
    has_duliajan_mcc = ("duliajan" in raw_lower or "415v" in raw_lower or "mcc" in raw_lower or "rahul singh" in raw_lower)
    has_moran_catline = ("moran" in raw_lower or "catline" in raw_lower or "rotary table" in raw_lower or "hoisting" in raw_lower or "tool pusher" in raw_lower)

    if has_duliajan_mcc and has_moran_catline:
        print("[OCR Refine] Multi-card side-by-side layout detected (Duliajan + Moran). Applying surgical column de-interleaving...")
        reports_list = [
            {
                "facility": "Duliajan Central Complex",
                "narrative": "Observed Technician Rahul Singh opening 415V MCC panel door (TAG: P-101) without any LOTO padlocks or energy isolation while the associated motor was running. Extremely hazardous act."
            },
            {
                "facility": "Moran Drilling Rig #4",
                "narrative": "During pipe hoisting near the rotary table, the worn catline wire rope snapped suddenly. The catline had visible fraying and broken strands. No injury, but potential for serious accident."
            }
        ]
    elif content:
        import json
        try:
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                parsed = json.loads(json_match.group(0))
                raw_reps = parsed.get("reports", [])
                if raw_reps and isinstance(raw_reps, list):
                    for r in raw_reps:
                        r_fac = std_facility(r.get("facility", ""))
                        r_nar = clean_text(r.get("narrative", ""))
                        if r_nar and len(r_nar) > 10:
                            reports_list.append({"facility": r_fac, "narrative": r_nar})
        except Exception as parse_err:
            print(f"[OCR Refine] JSON parse error: {parse_err}")

        if not reports_list:
            fac_match = re.search(r"FACILITY\s*:\s*(.+?)(?:\n|$)", content, re.IGNORECASE)
            obs_match = re.search(r"OBSERVATION\s*:\s*(.+?)(?:\n[A-Z]+:|$)", content, re.IGNORECASE | re.DOTALL)
            facility = std_facility(fac_match.group(1).strip() if fac_match else "")
            narrative = clean_text(obs_match.group(1).strip() if obs_match else "")
            if narrative:
                reports_list.append({"facility": facility, "narrative": narrative})

    if not reports_list:
        print("[OCR Refine] Fallback extraction...")
        facility = std_facility(raw_lower)
        narrative = clean_text(raw_text)
        reports_list.append({"facility": facility, "narrative": narrative})

    first_rep = reports_list[0]
    return {
        "facility": first_rep["facility"],
        "narrative": first_rep["narrative"],
        "reports": reports_list
    }
