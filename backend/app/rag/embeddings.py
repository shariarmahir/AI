"""Embedding generation. Uses multilingual sentence-transformers — works for Bangla and English."""
from sentence_transformers import SentenceTransformer
from functools import lru_cache
from ..config import get_settings


@lru_cache
def get_embedding_model() -> SentenceTransformer:
    settings = get_settings()
    model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts. Returns list of float vectors.

    Vectors are L2-normalized so that ChromaDB's cosine space yields distances
    in [0, 2] and similarity = 1 - distance is meaningful.
    """
    model = get_embedding_model()
    embeddings = model.encode(
        texts, convert_to_numpy=True, show_progress_bar=False, normalize_embeddings=True
    )
    return embeddings.tolist()


def embed_query(text: str) -> list[float]:
    """Embed a single query."""
    return embed_texts([text])[0]
