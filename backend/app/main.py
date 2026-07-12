
"""CJP Healthtech - AI Healthcare Assistant for Bangladesh

FastAPI backend with RAG, multi-agent system, and safety guardrails.
"""
import sys, io
# Force UTF-8 for stdout/stderr on Windows (avoids charmap errors with Bangla text)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import get_settings
from .routes import chat, triage, image, hospitals, diseases, health
from .rag.ingestion import ingest_all
from .rag.chroma_client import get_chroma


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm RAG if empty
    try:
        chroma = get_chroma()
        if chroma.count() == 0:
            print("[RAG] Knowledge base empty, ingesting...")
            ingest_all()
        else:
            print(f"[RAG] Knowledge base loaded: {chroma.count()} documents")
    except Exception as e:
        print(f"[RAG] Initialization warning: {e}")

    yield

    # Shutdown: nothing for now
    print("Shutting down...")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="CJP Healthtech AI Assistant",
        description="AI-powered healthcare assistant for Bangladesh — women's health focus. "
                    "Built with FastAPI, Claude, ChromaDB, and Google Maps.",
        version="0.1.0",
        lifespan=lifespan
    )

    # allow_origin_regex covers every *.vercel.app deployment: each Vercel deploy
    # gets a fresh URL, so an exact-match whitelist goes stale immediately.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_origin_regex=settings.CORS_ORIGIN_REGEX or None,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print(f"[CORS] origins: {settings.cors_origins_list}")
    print(f"[CORS] regex:   {settings.CORS_ORIGIN_REGEX}")

    # Routes
    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(triage.router)
    app.include_router(image.router)
    app.include_router(hospitals.router)
    app.include_router(diseases.router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
