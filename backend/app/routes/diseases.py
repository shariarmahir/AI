"""Diseases knowledge base endpoint - browse and search the 100-disease database."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from ..config import get_settings
from ..schemas.models import DiseaseInfo

router = APIRouter(prefix="/api/diseases", tags=["diseases"])

_cache = None


def _load_diseases():
    global _cache
    if _cache is None:
        path = Path(get_settings().DISEASES_DATA_PATH)
        if path.exists():
            _cache = json.loads(path.read_text(encoding='utf-8'))
        else:
            _cache = []
    return _cache


@router.get("")
async def list_diseases(
    category: str | None = Query(None),
    specialty: str | None = Query(None),
    search: str | None = Query(None),
    limit: int = Query(100, ge=1, le=200)
):
    """List diseases with optional filters."""
    diseases = _load_diseases()

    if category:
        diseases = [d for d in diseases if d["category"] == category]
    if specialty:
        diseases = [d for d in diseases if d["specialty"] == specialty]
    if search:
        s = search.lower()
        diseases = [
            d for d in diseases
            if s in d["name_en"].lower() or s in d.get("name_bn", "") or s in d.get("summary", "").lower()
        ]

    # Return summary view (no Q&As in list view)
    return [
        {
            "id": d["id"],
            "name_en": d["name_en"],
            "name_bn": d["name_bn"],
            "category": d["category"],
            "specialty": d["specialty"],
            "prevalence_bd": d.get("prevalence_bd", "unknown"),
            "summary": d["summary"]
        }
        for d in diseases[:limit]
    ]


@router.get("/{disease_id}")
async def get_disease(disease_id: str):
    """Get full details for a specific disease."""
    diseases = _load_diseases()
    disease = next((d for d in diseases if d["id"] == disease_id), None)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease


@router.get("/categories/list")
async def list_categories():
    diseases = _load_diseases()
    categories = sorted(set(d["category"] for d in diseases))
    return {"categories": categories}
