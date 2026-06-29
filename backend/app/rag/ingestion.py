"""Document ingestion: loads diseases JSON and Q&A pairs into ChromaDB."""
import json
from pathlib import Path
from ..config import get_settings
from .chroma_client import get_chroma
from .embeddings import embed_texts


def _format_disease_document(d: dict) -> str:
    """Build a rich text document from a disease entry for embedding."""
    parts = [
        f"Disease: {d['name_en']} ({d['name_bn']})",
        f"Category: {d['category']}",
        f"Specialty: {d['specialty']}",
        f"Summary: {d['summary']}",
        f"Symptoms: {', '.join(d['symptoms'])}",
        f"Causes: {', '.join(d['causes'])}",
        f"Risk factors: {', '.join(d['risk_factors'])}",
        f"Complications: {', '.join(d['complications'])}",
        f"Red flags: {', '.join(d['red_flags'])}",
        f"Treatment: {d['treatment_overview']}",
        f"Prevention: {', '.join(d['prevention'])}",
        f"Bangladesh context: {d['bd_context']}",
    ]
    return "\n".join(parts)


def _format_qa_document(qa: dict) -> str:
    return f"Q: {qa['question']}\nA: {qa['answer']}\nRelated condition: {qa['disease_name_en']} ({qa['category']})"


def ingest_all(reset: bool = False) -> dict:
    """Ingest both disease database and Q&A pairs into ChromaDB."""
    settings = get_settings()
    chroma = get_chroma()

    if reset:
        chroma.reset()

    if chroma.count() > 0 and not reset:
        return {"status": "already_ingested", "documents": chroma.count()}

    # Load data
    diseases = json.loads(Path(settings.DISEASES_DATA_PATH).read_text(encoding='utf-8'))
    qa_pairs = json.loads(Path(settings.QA_DATA_PATH).read_text(encoding='utf-8'))

    # ─── Ingest diseases ───
    disease_docs = [_format_disease_document(d) for d in diseases]
    disease_ids = [f"disease__{d['id']}" for d in diseases]
    disease_metas = [
        {
            "type": "disease",
            "disease_id": d["id"],
            "name_en": d["name_en"],
            "name_bn": d["name_bn"],
            "category": d["category"],
            "specialty": d["specialty"],
            "prevalence_bd": d.get("prevalence_bd", "unknown")
        }
        for d in diseases
    ]

    print(f"Embedding {len(disease_docs)} diseases...")
    disease_embeddings = embed_texts(disease_docs)
    chroma.add(disease_ids, disease_docs, disease_embeddings, disease_metas)

    # ─── Ingest Q&As ───
    qa_docs = [_format_qa_document(qa) for qa in qa_pairs]
    qa_ids = [f"qa__{i}" for i in range(len(qa_pairs))]
    qa_metas = [
        {
            "type": "qa",
            "disease_id": qa["disease_id"],
            "name_en": qa["disease_name_en"],
            "category": qa["category"],
            "specialty": qa["specialty"]
        }
        for qa in qa_pairs
    ]

    # Embed in batches to manage memory
    print(f"Embedding {len(qa_docs)} Q&A pairs (batched)...")
    batch_size = 100
    for i in range(0, len(qa_docs), batch_size):
        batch_docs = qa_docs[i:i+batch_size]
        batch_ids = qa_ids[i:i+batch_size]
        batch_metas = qa_metas[i:i+batch_size]
        batch_embeddings = embed_texts(batch_docs)
        chroma.add(batch_ids, batch_docs, batch_embeddings, batch_metas)
        print(f"  Batch {i//batch_size + 1}/{(len(qa_docs)+batch_size-1)//batch_size}")

    total = chroma.count()
    print(f"[RAG] Ingestion complete. Total documents: {total}")
    return {
        "status": "ingested",
        "diseases": len(diseases),
        "qa_pairs": len(qa_pairs),
        "total_documents": total
    }


if __name__ == "__main__":
    import sys
    reset = "--reset" in sys.argv
    result = ingest_all(reset=reset)
    print(json.dumps(result, indent=2))
