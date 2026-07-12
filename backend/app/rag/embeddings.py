"""Embedding generation.

Uses ChromaDB's bundled ONNX MiniLM rather than sentence-transformers. Both
produce 384-dim vectors, but sentence-transformers drags in the full PyTorch
runtime (~300MB resident) purely to run a 22M-parameter model — which does not
fit alongside chromadb + FastAPI in a 512MB container. ONNX Runtime ships with
chromadb already and runs the same class of model in roughly a tenth of the
memory.

Tradeoff: the ONNX model is English-optimized, so Bangla-script queries embed
less precisely than the old multilingual checkpoint did. Banglish and English
retrieval are unaffected, and the LLM itself still reads and answers in Bangla.
"""
from functools import lru_cache

from chromadb.utils import embedding_functions

_EPS = 1e-12


@lru_cache
def get_embedding_model():
    """Cached ONNX MiniLM embedder (downloads once, ~80MB, then reused)."""
    return embedding_functions.ONNXMiniLM_L6_V2()


def _normalize(vector: list[float]) -> list[float]:
    """L2-normalize so ChromaDB's cosine space yields distances in [0, 2] and
    similarity = 1 - distance stays meaningful."""
    norm = sum(v * v for v in vector) ** 0.5
    if norm < _EPS:
        return vector
    return [v / norm for v in vector]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts. Returns list of float vectors."""
    if not texts:
        return []
    model = get_embedding_model()
    return [_normalize([float(v) for v in vector]) for vector in model(texts)]


def embed_query(text: str) -> list[float]:
    """Embed a single query."""
    return embed_texts([text])[0]
