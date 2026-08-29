"""
Integration test for the /classify endpoint — confirms the FastAPI app
wires the schema and classifier together correctly end-to-end (with the
Groq API call mocked, so no real API key or network access is needed).
"""

from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def fake_api_key(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "test-key-not-real")


def _mock_groq_response(content: str) -> MagicMock:
    mock = MagicMock()
    mock.json.return_value = {"choices": [{"message": {"content": content}}]}
    mock.raise_for_status.return_value = None
    return mock


def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_list_rules_endpoint():
    resp = client.get("/rules")
    assert resp.status_code == 200
    rules = resp.json()
    assert len(rules) == 9
    assert any(r["name"] == "Energy Isolation" for r in rules)


def test_dashboard_stats_endpoint():
    resp = client.get("/dashboard/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_reports" in data
    assert "sif_count" in data
    assert "sif_density" in data
    assert "by_rule" in data
    assert "by_site" in data


def test_dashboard_patterns_endpoint():
    resp = client.get("/dashboard/patterns")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_reports_endpoint():
    resp = client.get("/reports?limit=10")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


def test_classify_endpoint_success():
    content = '{"verdict": "SIF-potential", "confidence": 0.88, "reasoning": "Confined space entry without atmosphere testing."}'
    with patch("app.classifier.requests.post", return_value=_mock_groq_response(content)):
        resp = client.post(
            "/classify",
            json={
                "report_text": "Worker entered tank without gas testing or standby attendant.",
                "site": "Terminal-B",
                "activity": "Confined Space Entry",
            },
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["verdict"] == "SIF-potential"
    assert body["confidence"] == 0.88


def test_classify_endpoint_rejects_short_input():
    """Schema validation should reject a report_text that's too short to be meaningful."""
    resp = client.post("/classify", json={"report_text": "Hi"})
    assert resp.status_code == 422  # FastAPI's validation error status


def test_classify_endpoint_returns_503_when_groq_down():
    import requests

    with patch("app.classifier.requests.post", side_effect=requests.exceptions.ConnectionError):
        resp = client.post("/classify", json={"report_text": "Some report text here."})

    assert resp.status_code == 503


def test_classify_endpoint_returns_503_when_api_key_missing(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    resp = client.post("/classify", json={"report_text": "Some report text here."})
    assert resp.status_code == 503
