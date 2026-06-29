"""Triage Agent — the demo gold endpoint.

Takes symptoms + patient context, returns structured triage:
- Suggested specialty
- Urgency level
- Possible conditions
- Red flags
- Self-care tips
- Questions for doctor

Combines: Claude reasoning + RAG-matched diseases + hospital finder.
"""
import json
import re
from .base import BaseAgent
from .disease_recommender import DiseaseRecommenderAgent
from .hospital_finder import HospitalFinderAgent
from ..prompts.system_prompts import TRIAGE_SYSTEM
from ..safety.guardrails import detect_emergency, emergency_response, validate_response
from ..safety.confidence import compute_confidence
from ..safety.disclaimers import get_disclaimer
from ..rag.retrieval import retrieve_diseases_for_symptoms


class TriageAgent(BaseAgent):

    def __init__(self):
        super().__init__()
        self.disease_recommender = DiseaseRecommenderAgent()
        self.hospital_finder = HospitalFinderAgent()

    def triage(self, symptoms: str, lat: float | None, lng: float | None,
               age: int | None, gender: str, duration_days: int | None = None,
               pregnant: bool | None = None) -> dict:

        # Step 1: emergency detection
        is_emergency, matched = detect_emergency(symptoms)

        # Step 2: classify with Claude
        patient_context = f"Patient: {gender}, age {age or 'unknown'}"
        if duration_days:
            patient_context += f", symptoms for {duration_days} days"
        if pregnant:
            patient_context += ", pregnant"

        user_message = f"{patient_context}\nSymptoms: {symptoms}\n\nRespond in JSON only."

        raw_response = self.call_claude(
            system=TRIAGE_SYSTEM,
            messages=[{"role": "user", "content": user_message}],
            max_tokens=1200
        )

        parsed = self._extract_json(raw_response)
        if not parsed:
            # Fallback minimal response
            parsed = {
                "specialty": "general medicine",
                "urgency": "high" if is_emergency else "medium",
                "summary": "Unable to fully classify. Please see a general physician for evaluation.",
                "possible_conditions": [],
                "risk_factors": [],
                "red_flags": [],
                "self_care": [],
                "questions_for_doctor": []
            }

        # Step 3: override urgency to emergency if emergency keywords detected
        if is_emergency and parsed.get("urgency") != "emergency":
            parsed["urgency"] = "emergency"

        # Step 4: RAG-match against disease KB
        disease_matches = self.disease_recommender.match_diseases(symptoms, top_n=3)

        # Step 5: find nearby hospitals
        hospitals = []
        if lat is not None and lng is not None:
            specialty_for_search = parsed.get("specialty", "hospital")
            hospitals = self.hospital_finder.find_nearby(
                lat=lat, lng=lng, specialty=specialty_for_search, radius_meters=10000
            )

        # Step 6: confidence
        retrieved = retrieve_diseases_for_symptoms(symptoms, n=3)
        confidence_score = compute_confidence(retrieved, raw_response)
        if confidence_score >= 0.7:
            confidence_label = "high"
        elif confidence_score >= 0.4:
            confidence_label = "medium"
        else:
            confidence_label = "low"

        return {
            **parsed,
            "matched_diseases": disease_matches,
            "hospitals": hospitals,
            "confidence": confidence_label,
            "flagged_emergency": is_emergency,
            "emergency_keywords": matched,
            "disclaimer": get_disclaimer(symptoms),
            "_raw_response": raw_response if False else None  # debug only
        }

    def _extract_json(self, text: str) -> dict | None:
        """Extract JSON from response, handling potential markdown fences."""
        # Strip markdown code fences
        text = re.sub(r"```(?:json)?\n?", "", text)
        text = text.replace("```", "")

        # Find first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            return None

        try:
            return json.loads(text[start:end+1])
        except json.JSONDecodeError:
            return None
