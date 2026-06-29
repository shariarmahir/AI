"""Disease Recommender Agent — matches symptoms against the 100-disease knowledge base.

Returns top candidate diseases with confidence scores.
"""
import json
from pathlib import Path
from .base import BaseAgent
from ..rag.retrieval import retrieve_diseases_for_symptoms
from ..config import get_settings


class DiseaseRecommenderAgent(BaseAgent):

    def __init__(self):
        super().__init__()
        self._diseases_by_id = {}
        self._load_diseases()

    def _load_diseases(self):
        path = Path(get_settings().DISEASES_DATA_PATH)
        if path.exists():
            diseases = json.loads(path.read_text(encoding='utf-8'))
            self._diseases_by_id = {d["id"]: d for d in diseases}

    def match_diseases(self, symptoms: str, top_n: int = 5) -> list[dict]:
        """Semantic match against disease entries. Returns scored candidates with details."""
        results = retrieve_diseases_for_symptoms(symptoms, n=top_n)

        matches = []
        for r in results:
            disease_id = r["metadata"].get("disease_id")
            disease = self._diseases_by_id.get(disease_id, {})
            matches.append({
                "id": disease_id,
                "name_en": disease.get("name_en"),
                "name_bn": disease.get("name_bn"),
                "category": disease.get("category"),
                "specialty": disease.get("specialty"),
                "match_score": round(r["similarity"], 3),
                "summary": disease.get("summary"),
                "key_symptoms": disease.get("symptoms", [])[:5],
                "red_flags": disease.get("red_flags", []),
                "specialty_for_referral": disease.get("specialty")
            })

        return matches

    def get_disease_info(self, disease_id: str) -> dict | None:
        return self._diseases_by_id.get(disease_id)
