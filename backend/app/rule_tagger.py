"""
IOGP Life-Saving Rule tagger using semantic similarity.

Step 2 of the build order: given a safety report already classified as
SIF-potential (Step 1), identify which of the 9 IOGP Life-Saving Rules
is most relevant.

Design notes:
- Uses sentence-transformers (all-MiniLM-L6-v2) for genuine NLP embeddings
  when available. Falls back to TF-IDF + cosine similarity if torch is not
  installed — same interface, lighter dependency, still real NLP.
- The "index" is just 9 vectors (one per rule). There's no training step —
  we embed the rule descriptions once, then compare each incoming report
  against all 9 via cosine similarity.
- This is a retrieval approach, not a generative one: deterministic, fast,
  and explainable (same report always maps to the same rule).
"""

import json
import math
import os
import re
from collections import Counter
from pathlib import Path
from typing import Optional

RULES_PATH = Path(__file__).parent / "data" / "iogp_rules.json"

# ---------- Load rules ----------

def _load_rules() -> list[dict]:
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

RULES = _load_rules()

# ---------- Embedding backend selection ----------

_BACKEND: Optional[str] = None
_model = None
_rule_embeddings = None


def _init_backend():
    """Try sentence-transformers first; fall back to TF-IDF."""
    global _BACKEND, _model, _rule_embeddings

    if _BACKEND is not None:
        return  # already initialized

    try:
        import importlib
        st_module = importlib.import_module("sentence_transformers")
        SentenceTransformer = getattr(st_module, "SentenceTransformer")

        _model = SentenceTransformer("all-MiniLM-L6-v2")
        rule_texts = [
            f"{r['name']}. {r['description']} {r.get('keywords', '')}"
            for r in RULES
        ]
        _rule_embeddings = _model.encode(rule_texts, normalize_embeddings=True)
        _BACKEND = "sentence-transformers"
    except (ImportError, Exception):
        # Fallback: TF-IDF based cosine similarity (no torch/external model needed)
        _BACKEND = "tfidf"
        _rule_embeddings = _build_tfidf_vectors()


# ---------- TF-IDF fallback ----------

_idf_cache: dict[str, float] = {}
_vocab: list[str] = []


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def _build_tfidf_vectors():
    """Build TF-IDF vectors for all 9 rules (fallback when torch unavailable)."""
    global _idf_cache, _vocab

    rule_texts = [
        f"{r['name']} {r['description']} {r.get('keywords', '')}"
        for r in RULES
    ]
    # Build vocabulary and document frequencies
    doc_freq: dict[str, int] = Counter()
    tokenized_docs = []
    for text in rule_texts:
        tokens = set(_tokenize(text))
        tokenized_docs.append(_tokenize(text))
        for tok in tokens:
            doc_freq[tok] += 1

    n_docs = len(rule_texts)
    _vocab = sorted(doc_freq.keys())
    vocab_idx = {w: i for i, w in enumerate(_vocab)}
    _idf_cache = {w: math.log((n_docs + 1) / (df + 1)) + 1 for w, df in doc_freq.items()}

    # Build TF-IDF vectors
    vectors = []
    for tokens in tokenized_docs:
        tf = Counter(tokens)
        vec = [0.0] * len(_vocab)
        for tok, count in tf.items():
            if tok in vocab_idx:
                vec[vocab_idx[tok]] = count * _idf_cache.get(tok, 1.0)
        # Normalize
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        vec = [v / norm for v in vec]
        vectors.append(vec)

    return vectors


def _tfidf_embed(text: str) -> list[float]:
    """Embed a single text using the TF-IDF vocabulary."""
    tokens = _tokenize(text)
    tf = Counter(tokens)
    vocab_idx = {w: i for i, w in enumerate(_vocab)}
    vec = [0.0] * len(_vocab)
    for tok, count in tf.items():
        if tok in vocab_idx:
            vec[vocab_idx[tok]] = count * _idf_cache.get(tok, 1.0)
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


# ---------- Public API ----------

def tag_rule(report_text: str) -> dict:
    """
    Match a safety report to the most relevant IOGP Life-Saving Rule.

    Returns:
        {"rule": "Energy Isolation", "rule_id": 4, "confidence": 0.87, "icon": "zap-off"}
    """
    _init_backend()

    if _BACKEND == "sentence-transformers":
        import numpy as np
        query_vec = _model.encode([report_text], normalize_embeddings=True)
        similarities = (query_vec @ _rule_embeddings.T)[0]
        best_idx = int(np.argmax(similarities))
        best_score = float(similarities[best_idx])
    else:
        # TF-IDF fallback
        query_vec = _tfidf_embed(report_text)
        similarities = [_cosine_similarity(query_vec, rv) for rv in _rule_embeddings]
        best_idx = max(range(len(similarities)), key=lambda i: similarities[i])
        best_score = similarities[best_idx]

    rule = RULES[best_idx]
    return {
        "rule": rule["name"],
        "rule_id": rule["id"],
        "confidence": round(max(0.0, min(1.0, best_score)), 4),
        "icon": rule.get("icon", "shield"),
    }


def get_all_rules() -> list[dict]:
    """Return all 9 IOGP Life-Saving Rules."""
    return RULES


def get_backend_info() -> str:
    """Return which embedding backend is active (for diagnostics)."""
    _init_backend()
    return _BACKEND
