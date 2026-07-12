"""Application configuration loaded from environment variables."""
import json
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Keys
    ANTHROPIC_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    NVIDIA_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    GITHUB_PAT: str = ""
    GH_TOKEN: str = ""

    # Model (OpenRouter fallback)
    CLAUDE_MODEL: str = "anthropic/claude-sonnet-4-5"
    CLAUDE_MAX_TOKENS: int = 2048

    # NVIDIA NIM (preferred provider when NVIDIA_API_KEY is set)
    NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NIM_MODEL: str = "mistralai/mistral-small-4-119b-2603"
    # Mistral Small handles medical images; llama-3.2-vision hard-refuses them
    # ("I'm not able to view the image") regardless of prompting.
    NIM_VISION_MODEL: str = "mistralai/mistral-small-4-119b-2603"

    # Embeddings. Reported by /health. The actual embedder is chromadb's bundled
    # ONNX MiniLM (see app/rag/embeddings.py), chosen so the container fits in
    # 512MB — sentence-transformers pulled in ~300MB of PyTorch runtime.
    EMBEDDING_MODEL: str = "chromadb/onnx-all-MiniLM-L6-v2"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    COLLECTION_NAME: str = "cjp_medical_kb"

    # Server
    PORT: int = 8000

    # Deliberately a plain str, not list[str]. pydantic-settings JSON-decodes any
    # "complex" field (list/dict) inside its env source — *before* field validators
    # run — so a comma-separated CORS_ORIGINS from Render raised SettingsError and
    # crashed the app at startup. Keeping it a str bypasses that machinery; use
    # cors_origins_list to read it. Both "a,b" and '["a","b"]' are accepted.
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Every Vercel deploy mints a new URL, so an exact-match whitelist goes stale on
    # the next push. Match by pattern instead — but scoped to THIS project only.
    #
    # A broad r"https://.*\.vercel\.app" would be a real vulnerability: anyone can
    # deploy to vercel.app in minutes, and with allow_credentials=True that lets an
    # attacker's site make credentialed cross-origin calls and read the responses.
    #
    # Covers both forms this project actually serves:
    #   frontend-psi-opal-71.vercel.app                        (stable alias)
    #   frontend-7rbk3ue7x-mahirs-projects-a89fb7dd.vercel.app (per-deploy)
    # Anchored with \A...\Z so no prefix/suffix can smuggle in another host.
    CORS_ORIGIN_REGEX: str = (
        r"\Ahttps://frontend-[a-z0-9-]+(-mahirs-projects-a89fb7dd)?\.vercel\.app\Z"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        raw = (self.CORS_ORIGINS or "").strip()
        if not raw:
            return []
        if raw.startswith("["):
            try:
                return [str(o).strip() for o in json.loads(raw) if str(o).strip()]
            except json.JSONDecodeError:
                pass  # malformed JSON — fall through to comma-splitting
        return [o.strip() for o in raw.split(",") if o.strip()]

    # Safety
    MIN_CONFIDENCE_THRESHOLD: float = 0.4
    ENABLE_EMERGENCY_DETECTION: bool = True

    # Data paths
    DISEASES_DATA_PATH: str = "./data/diseases.json"
    QA_DATA_PATH: str = "./data/qa_pairs.json"
    HOSPITALS_DATA_PATH: str = "./data/hospitals_dhaka.json"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
