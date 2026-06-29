"""Health check / status endpoint."""
import json
from pathlib import Path
from fastapi import APIRouter
from ..schemas.models import HealthCheck
from ..config import get_settings
from ..rag.chroma_client import get_chroma

router = APIRouter(tags=["system"])


@router.get("/", response_model=HealthCheck)
async def health():
    settings = get_settings()

    # Count diseases
    diseases_count = 0
    path = Path(settings.DISEASES_DATA_PATH)
    if path.exists():
        diseases_count = len(json.loads(path.read_text(encoding='utf-8')))

    # Count RAG documents
    rag_count = 0
    try:
        rag_count = get_chroma().count()
    except Exception:
        pass

    return HealthCheck(
        status="ok",
        model=settings.CLAUDE_MODEL,
        rag_documents=rag_count,
        diseases_loaded=diseases_count,
        embedding_model=settings.EMBEDDING_MODEL
    )
