"""Retrieval: semantic search over the ingested medical knowledge."""
from .chroma_client import get_chroma
from .embeddings import embed_query


def retrieve(query: str, n_results: int = 5, filter_type: str | None = None, filter_category: str | None = None) -> list[dict]:
    """Retrieve top-N relevant documents for a query.

    Args:
        query: User question or symptoms text
        n_results: How many results to return
        filter_type: 'disease' or 'qa' to filter by document type
        filter_category: filter by disease category (e.g. 'gynecology')

    Returns:
        List of {document, metadata, distance, similarity} dicts
    """
    chroma = get_chroma()
    query_embedding = embed_query(query)

    where = {}
    if filter_type and filter_category:
        where = {"$and": [{"type": filter_type}, {"category": filter_category}]}
    elif filter_type:
        where = {"type": filter_type}
    elif filter_category:
        where = {"category": filter_category}

    results = chroma.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where if where else None
    )

    formatted = []
    if results["documents"] and len(results["documents"][0]) > 0:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            # Convert cosine distance to similarity (rough)
            similarity = max(0.0, 1.0 - dist)
            formatted.append({
                "document": doc,
                "metadata": meta,
                "distance": dist,
                "similarity": similarity
            })

    return formatted


def retrieve_diseases_for_symptoms(symptoms: str, n: int = 3) -> list[dict]:
    """Find disease entries semantically matching a symptom description."""
    return retrieve(symptoms, n_results=n, filter_type="disease")


def retrieve_qa_for_question(question: str, n: int = 5) -> list[dict]:
    """Find similar Q&A pairs from the knowledge base."""
    return retrieve(question, n_results=n, filter_type="qa")


def build_context_block(retrieved: list[dict], max_chars: int = 3000) -> str:
    """Build a concise <context> block from retrieved docs to inject into LLM prompt."""
    if not retrieved:
        return ""

    parts = []
    total = 0
    for r in retrieved:
        doc = r["document"]
        meta = r["metadata"]
        block = f"[Source: {meta.get('name_en', 'unknown')} - similarity {r['similarity']:.2f}]\n{doc}\n"
        if total + len(block) > max_chars:
            break
        parts.append(block)
        total += len(block)

    return "<context>\n" + "\n---\n".join(parts) + "\n</context>"
