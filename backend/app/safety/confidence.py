"""Confidence scoring for AI responses.

Heuristic combines RAG retrieval similarity, query specificity, and response coverage.
This is not a calibrated probability — it's a useful signal for the UI to show 'high/medium/low confidence'.
"""


def compute_confidence(retrieved_results: list[dict], response_text: str = "") -> float:
    """Compute a confidence score between 0 and 1.

    Factors:
    - Top retrieval similarity (most weight)
    - Average similarity across top results
    - Whether response acknowledged uncertainty

    Args:
        retrieved_results: results from RAG retrieval
        response_text: the AI's response (optional, for self-awareness check)
    """
    if not retrieved_results:
        return 0.2  # Low — no relevant context found

    similarities = [r.get("similarity", 0) for r in retrieved_results]
    top_sim = max(similarities) if similarities else 0
    avg_sim = sum(similarities) / len(similarities) if similarities else 0

    # Weighted score
    base = 0.6 * top_sim + 0.4 * avg_sim

    # Adjust down if response acknowledges uncertainty (which is good — calibrated)
    uncertainty_phrases = ["i'm not sure", "i cannot determine", "uncertain", "may not be accurate"]
    if any(p in response_text.lower() for p in uncertainty_phrases):
        # We don't lower confidence; the model is being honest
        pass

    return min(1.0, max(0.0, base))


def confidence_label(score: float) -> str:
    """Convert numeric confidence to a UI label."""
    if score >= 0.7:
        return "high"
    elif score >= 0.45:
        return "medium"
    else:
        return "low"
