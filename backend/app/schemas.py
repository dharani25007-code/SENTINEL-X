"""
Request/response schemas for the SIF Precursor Detection Engine.

Covers all steps:
- Step 1: SIF classification (verdict, confidence, reasoning)
- Step 2: IOGP rule tagging (iogp_rule, iogp_rule_confidence)
- Step 3: Dashboard data models
- Step 4: Explainability (explanation word weights)
"""

from pydantic import BaseModel, Field
from typing import Optional


class ReportInput(BaseModel):
    """A single free-text safety report submitted for classification."""
    report_text: str = Field(
        ...,
        min_length=5,
        description="The raw free-text safety report (unsafe act, unsafe condition, or near-miss).",
        examples=[
            "Contractor was seen welding near an open valve with a strong gas smell in the area. No fire watch present."
        ],
    )
    site: str | None = Field(
        default=None,
        description="Optional site/location identifier for pattern analysis.",
    )
    activity: str | None = Field(
        default=None,
        description="Optional activity tag (e.g. 'Hot Work', 'Excavation').",
    )


class WordWeight(BaseModel):
    """A single word and its importance weight from LIME explanation."""
    word: str
    weight: float


class ClassificationResult(BaseModel):
    """The classifier's full verdict on a single report."""
    verdict: str = Field(..., description="'SIF-potential' or 'routine'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model's confidence in the verdict, 0-1.")
    reasoning: str = Field(..., description="Short natural-language justification for the verdict.")
    raw_model_output: str = Field(..., description="The unparsed model response, kept for debugging/audit.")
    iogp_rule: str | None = Field(default=None, description="Matched IOGP Life-Saving Rule (Step 2).")
    iogp_rule_confidence: float | None = Field(default=None, description="Confidence of the rule match, 0-1.")
    iogp_rule_icon: str | None = Field(default=None, description="Icon name for the matched rule.")
    explanation: list[WordWeight] | None = Field(default=None, description="LIME word importance scores (Step 4).")


class ClassificationError(BaseModel):
    detail: str


# --- Dashboard models ---

class DashboardStats(BaseModel):
    total_reports: int
    sif_count: int
    routine_count: int
    sif_density: float
    high_risk_sites: int
    by_rule: list[dict]
    by_site: list[dict]
    trend: list[dict]


class PatternItem(BaseModel):
    site: str
    activity: str
    rule: str
    count: int
    avg_confidence: float


class RuleInfo(BaseModel):
    id: int
    name: str
    icon: str
    description: str
