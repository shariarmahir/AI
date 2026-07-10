"""Banglish query normalization.

Users of this app write in three registers, often mixed within a single query:
  - Bangla script:  "পেটে ব্যথা"
  - English:         "abdominal pain"
  - Banglish (Bangla words in Latin letters): "pete betha"

The embedding model (paraphrase-multilingual-MiniLM) understands Bangla and
English well, but Banglish transliterations are out-of-distribution — "pete
betha" does not embed near "abdominal pain". To fix retrieval we expand any
recognized Banglish phrase into its Bangla + English equivalents and append
them to the query before embedding, so the same knowledge is retrieved
regardless of how the user typed it.
"""
import json
import re
from functools import lru_cache
from pathlib import Path
from ..config import get_settings


@lru_cache
def _load_lexicon() -> dict[str, dict]:
    """Load the Banglish -> {en, bn} lexicon, keyed by lowercase phrase."""
    settings = get_settings()
    path = Path(settings.DISEASES_DATA_PATH).parent / "banglish_lexicon.json"
    if not path.exists():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    return {k.lower(): v for k, v in raw.items()}


def expand_banglish(query: str) -> str:
    """Append Bangla + English equivalents for any Banglish phrases found.

    Matching is longest-phrase-first so multi-word entries like
    'buker bampashe betha' win over the single word 'betha'. The original
    query is always preserved; expansions are appended, never replace.
    """
    lexicon = _load_lexicon()
    if not lexicon:
        return query

    lower = query.lower()
    # Longest phrases first so specific multi-word terms match before their parts.
    phrases = sorted(lexicon.keys(), key=len, reverse=True)

    additions: list[str] = []
    seen_spans: list[tuple[int, int]] = []

    for phrase in phrases:
        # Word-boundary search so "gas" doesn't match inside "gastric".
        for m in re.finditer(r"(?<![a-z])" + re.escape(phrase) + r"(?![a-z])", lower):
            span = (m.start(), m.end())
            # Skip if this span overlaps an already-matched (longer) phrase.
            if any(span[0] < e and s < span[1] for s, e in seen_spans):
                continue
            seen_spans.append(span)
            entry = lexicon[phrase]
            additions.append(entry["en"])
            additions.append(entry["bn"])

    if not additions:
        return query

    # Deduplicate while preserving order.
    uniq: list[str] = []
    for a in additions:
        if a not in uniq:
            uniq.append(a)

    return query + " | " + " ; ".join(uniq)


def normalize_query(query: str) -> str:
    """Public entry point: normalize a user query for embedding/retrieval."""
    query = query.strip()
    if not query:
        return query
    return expand_banglish(query)
