"""
Batch-evaluate the classifier against the synthetic labeled dataset.

Run this locally, with GROQ_API_KEY set (via .env file or shell), to
check Step 1 is actually working end-to-end before moving on to Step 2
(rule-tagging):

    cd backend
    python -m scripts.evaluate_classifier

(GROQ_API_KEY is picked up automatically from a .env file if present —
see .env.example. No need to export it manually if you've set up .env.)

Note: the synthetic dataset is intentionally balanced (~50/50 SIF-potential
vs. routine) so both precision and recall are visible in this evaluation.
The brief's own cited real-world ratio (~20-25% of reports carrying genuine
fatal potential) describes prevalence in OIL's actual report volume, not
the composition of this test set — a balanced test set gives a clearer
read on classifier discrimination ability than an imbalanced one would.
"""

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.classifier import classify_report, GroqUnavailableError, ClassifierParseError

DATA_PATH = Path(__file__).resolve().parent.parent / "app" / "data" / "synthetic_reports.jsonl"


def load_dataset() -> list[dict]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main() -> None:
    dataset = load_dataset()
    print(f"Loaded {len(dataset)} labeled synthetic reports.\n")

    correct = 0
    errors = 0
    results = []

    for i, item in enumerate(dataset, start=1):
        report_text = item["report_text"]
        true_label = item["label"]

        try:
            result = classify_report(report_text)
        except GroqUnavailableError as exc:
            print(f"[FATAL] {exc}")
            sys.exit(1)
        except ClassifierParseError as exc:
            print(f"[{i}/{len(dataset)}] PARSE ERROR — {exc}")
            errors += 1
            continue

        is_correct = result.verdict == true_label
        correct += is_correct
        status = "correct" if is_correct else "WRONG"

        print(
            f"[{i}/{len(dataset)}] {status:7s} | true={true_label:13s} "
            f"pred={result.verdict:13s} conf={result.confidence:.2f} | {report_text[:60]}..."
        )
        results.append(
            {
                "report_text": report_text,
                "true_label": true_label,
                "predicted": result.verdict,
                "confidence": result.confidence,
                "reasoning": result.reasoning,
                "correct": is_correct,
            }
        )
        time.sleep(1.5)  # pace requests to respect Groq free-tier tokens-per-minute (TPM) limit

    total_scored = len(dataset) - errors
    accuracy = correct / total_scored if total_scored else 0.0

    print("\n" + "=" * 60)
    print(f"Accuracy: {correct}/{total_scored} = {accuracy:.1%}")
    if errors:
        print(f"Parse errors (excluded from accuracy): {errors}")
    print("=" * 60)

    out_path = Path(__file__).resolve().parent / "evaluation_results.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"\nFull results written to {out_path}")


if __name__ == "__main__":
    main()
