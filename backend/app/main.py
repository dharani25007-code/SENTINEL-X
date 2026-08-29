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

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .classifier import classify_report, GroqUnavailableError, ClassifierParseError
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


