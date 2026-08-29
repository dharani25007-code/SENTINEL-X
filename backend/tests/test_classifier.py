"""
Unit tests for the classifier's parsing/retry logic.

These tests mock the Groq API HTTP call so they run without a real API
key or network access — useful for CI or a quick sanity check. They do
NOT test classification accuracy (that needs a real model — see
scripts/evaluate_classifier.py for that, which requires GROQ_API_KEY).
"""

from unittest.mock import patch, MagicMock

import pytest

from app.classifier import classify_report, ClassifierParseError, GroqUnavailableError


def _mock_groq_response(content: str) -> MagicMock:
    """Build a mock matching Groq's OpenAI-compatible chat completion shape."""
    mock = MagicMock()
    mock.json.return_value = {"choices": [{"message": {"content": content}}]}
    mock.raise_for_status.return_value = None
    return mock


@pytest.fixture(autouse=True)
def fake_api_key(monkeypatch):
    """All tests need GROQ_API_KEY set, even though the HTTP call itself is mocked."""
    monkeypatch.setenv("GROQ_API_KEY", "test-key-not-real")


def test_classify_clean_json_response():
    """A well-formed JSON response should parse straightforwardly."""
    content = '{"verdict": "SIF-potential", "confidence": 0.92, "reasoning": "Hot work near flammable gas source."}'
    with patch("app.classifier.requests.post", return_value=_mock_groq_response(content)):
        result = classify_report("Welding near an open gas valve, no fire watch present.")

    assert result.verdict == "SIF-potential"
    assert result.confidence == 0.92
    assert "hot work" in result.reasoning.lower() or "gas" in result.reasoning.lower()


def test_classify_handles_markdown_fenced_json():
    """Some models wrap JSON in ```json ... ``` fences — this should still parse."""
    content = '```json\n{"verdict": "routine", "confidence": 0.7, "reasoning": "Minor housekeeping issue only."}\n```'
    with patch("app.classifier.requests.post", return_value=_mock_groq_response(content)):
        result = classify_report("Boxes left in walkway near the office.")

    assert result.verdict == "routine"
    assert result.confidence == 0.7


def test_classify_retries_on_malformed_output_then_succeeds():
    """First response is unparseable prose; retry should succeed on the second call."""
    bad_content = "I think this report describes a routine issue."
    good_content = '{"verdict": "routine", "confidence": 0.6, "reasoning": "No fatal hazard pattern identified."}'
    with patch(
        "app.classifier.requests.post",
        side_effect=[_mock_groq_response(bad_content), _mock_groq_response(good_content)],
    ) as mock_post:
        result = classify_report("Faded signage near Building 4.")

    assert result.verdict == "routine"
    assert mock_post.call_count == 2  # confirms the retry path was actually exercised


def test_classify_raises_after_two_failed_parses():
    """If both the original call and the retry fail to parse, raise ClassifierParseError."""
    with patch("app.classifier.requests.post", return_value=_mock_groq_response("not json at all, sorry")):
        with pytest.raises(ClassifierParseError):
            classify_report("Some report text.")


def test_classify_raises_on_unrecognised_verdict():
    """A syntactically valid JSON with an out-of-vocabulary verdict should still raise."""
    content = '{"verdict": "maybe", "confidence": 0.5, "reasoning": "unsure"}'
    with patch("app.classifier.requests.post", return_value=_mock_groq_response(content)):
        with pytest.raises(ClassifierParseError):
            classify_report("Ambiguous report text.")


def test_confidence_is_clamped_to_valid_range():
    """A model returning an out-of-range confidence (e.g. 1.4) should be clamped to 1.0."""
    content = '{"verdict": "SIF-potential", "confidence": 1.4, "reasoning": "overconfident model"}'
    with patch("app.classifier.requests.post", return_value=_mock_groq_response(content)):
        result = classify_report("Some dangerous-sounding report.")

    assert result.confidence == 1.0


def test_connection_error_raises_groq_unavailable():
    """If Groq can't be reached, we should get a clear, actionable error, not a raw traceback."""
    import requests

    with patch("app.classifier.requests.post", side_effect=requests.exceptions.ConnectionError):
        with pytest.raises(GroqUnavailableError):
            classify_report("Any report text.")


def test_missing_api_key_raises_groq_unavailable(monkeypatch):
    """If GROQ_API_KEY isn't set at all, fail fast with a clear, actionable message."""
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    with pytest.raises(GroqUnavailableError, match="GROQ_API_KEY"):
        classify_report("Any report text.")


def test_http_error_raises_groq_unavailable():
    """An HTTP error status (e.g. 401 invalid key, 429 rate limit) should be a clear error."""
    import requests

    mock_resp = MagicMock()
    mock_resp.raise_for_status.side_effect = requests.exceptions.HTTPError("401 Unauthorized")
    with patch("app.classifier.requests.post", return_value=mock_resp):
        with pytest.raises(GroqUnavailableError):
            classify_report("Any report text.")
