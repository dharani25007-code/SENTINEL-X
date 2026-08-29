"""
Lightweight word-importance explainer (LIME-style perturbation).

Step 4 of the build order: highlights which words in a safety report
pushed the classifier toward SIF-potential vs routine.

Design notes:
- Does NOT use the `lime` Python package (avoids heavy sklearn dependency).
- Instead, implements the same core idea directly: mask each word, re-run
  the classifier, and measure how much the confidence changes.
- Returns a list of (word, weight) pairs where positive weight means
  the word pushed toward SIF-potential, negative means toward routine.
- Rate-limit aware: only perturbs the N most "interesting" words to
  avoid hammering the Groq API with dozens of calls.
"""

import re
from typing import Optional

from .classifier import _call_groq, _extract_json, SYSTEM_PROMPT


MAX_PERTURBATIONS = 12  # max words to test (keeps API calls manageable)


def _get_important_words(text: str) -> list[str]:
    """Extract candidate words worth testing (skip short/common words)."""
    STOP_WORDS = {
        "a", "an", "the", "is", "was", "were", "are", "been", "be", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "shall", "can", "to", "of", "in", "for",
        "on", "with", "at", "by", "from", "as", "into", "through", "during",
        "before", "after", "above", "below", "between", "and", "but", "or",
        "nor", "not", "so", "yet", "both", "either", "neither", "each",
        "every", "all", "any", "few", "more", "most", "other", "some",
        "such", "no", "only", "own", "same", "than", "too", "very",
        "just", "that", "this", "these", "those", "it", "its", "he", "she",
        "they", "them", "their", "his", "her", "we", "you", "i", "me",
        "my", "your", "our", "who", "which", "what", "where", "when",
        "how", "if", "then", "there", "here",
    }
    words = re.findall(r"[a-zA-Z0-9\-/]+", text)
    # Keep unique words that are long enough and not stop words
    seen = set()
    result = []
    for w in words:
        w_lower = w.lower()
        if w_lower not in STOP_WORDS and len(w_lower) >= 3 and w_lower not in seen:
            seen.add(w_lower)
            result.append(w)
    return result


def _classify_quick(text: str) -> Optional[float]:
    """Run classifier and return SIF-potential confidence (0-1), or None on error."""
    try:
        raw = _call_groq(text)
        parsed = _extract_json(raw)
        verdict = parsed.get("verdict", "")
        confidence = float(parsed.get("confidence", 0.5))
        # Return positive for SIF-potential, negative for routine
        if verdict == "SIF-potential":
            return confidence
        else:
            return -confidence
    except Exception:
        return None


def explain_report(report_text: str, base_confidence: float, base_verdict: str) -> list[dict]:
    """
    Compute word-level importance scores for a classified report.

    Args:
        report_text: The original report text.
        base_confidence: The confidence from the original classification.
        base_verdict: The verdict from the original classification.

    Returns:
        List of {"word": str, "weight": float} sorted by absolute weight descending.
        Positive weight = pushes toward SIF-potential.
        Negative weight = pushes toward routine.
    """
    words = _get_important_words(report_text)

    # Limit perturbations to keep API calls manageable
    words_to_test = words[:MAX_PERTURBATIONS]

    base_score = base_confidence if base_verdict == "SIF-potential" else -base_confidence

    explanations = []
    for word in words_to_test:
        # Remove this word from the text
        pattern = re.compile(re.escape(word), re.IGNORECASE)
        perturbed = pattern.sub("___", report_text, count=1)

        perturbed_score = _classify_quick(perturbed)
        if perturbed_score is None:
            continue

        # Importance = how much removing this word changed the score
        # Positive means the word was pushing TOWARD SIF-potential
        importance = base_score - perturbed_score

        explanations.append({
            "word": word,
            "weight": round(importance, 4),
        })

    # Sort by absolute weight (most important first)
    explanations.sort(key=lambda x: abs(x["weight"]), reverse=True)

    return explanations
