"""ChromaDB persistent client wrapper."""
import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings
from ..config import get_settings


class _NoOpEmbeddingFunction(EmbeddingFunction):
    """Placeholder so chromadb never tries to load its built-in ONNX model.
    We always pass pre-computed embeddings directly, so this is never called."""
    def __call__(self, input: Documents) -> Embeddings:  # noqa: A002
        raise RuntimeError("Embedding function should not be called — pass embeddings directly.")


class ChromaClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        settings = get_settings()
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=settings.COLLECTION_NAME,
            embedding_function=_NoOpEmbeddingFunction(),
            metadata={"description": "CJP medical knowledge base"}
        )

    def count(self) -> int:
        return self.collection.count()

    def add(self, ids: list[str], documents: list[str], embeddings: list[list[float]], metadatas: list[dict]):
        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def query(self, query_embeddings: list[list[float]], n_results: int = 5, where: dict | None = None) -> dict:
        return self.collection.query(
            query_embeddings=query_embeddings,
            n_results=n_results,
            where=where
        )

    def reset(self):
        """Wipe and recreate collection — useful for re-ingestion."""
        settings = get_settings()
        try:
            self.client.delete_collection(settings.COLLECTION_NAME)
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(name=settings.COLLECTION_NAME)


def get_chroma() -> ChromaClient:
    return ChromaClient()
