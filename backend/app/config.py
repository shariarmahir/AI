"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Keys
    ANTHROPIC_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""

    # Model
    CLAUDE_MODEL: str = "anthropic/claude-sonnet-4-5"
    CLAUDE_MAX_TOKENS: int = 2048

    # Embeddings
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    COLLECTION_NAME: str = "cjp_medical_kb"

    # Server
    PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Safety
    MIN_CONFIDENCE_THRESHOLD: float = 0.4
    ENABLE_EMERGENCY_DETECTION: bool = True

    # Data paths
    DISEASES_DATA_PATH: str = "./data/diseases.json"
    QA_DATA_PATH: str = "./data/qa_pairs.json"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
