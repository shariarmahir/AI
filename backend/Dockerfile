FROM python:3.11-slim

WORKDIR /app

# System deps for chromadb + sentence-transformers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the ONNX embedding model into the image so the first request doesn't
# pay for the download. Must match the embedder in app/rag/embeddings.py.
RUN python -c "from chromadb.utils import embedding_functions; embedding_functions.ONNXMiniLM_L6_V2()(['warmup'])"

COPY . .

EXPOSE 8000

# Bind to the $PORT Render injects (falls back to 8000 locally). One worker:
# each would load its own copy of the model, and the free tier has 512MB.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
