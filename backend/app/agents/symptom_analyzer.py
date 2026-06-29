"""Symptom Analyzer Agent — conversational health Q&A grounded in RAG.

Used by /api/chat endpoint."""
from .base import BaseAgent
from ..prompts.system_prompts import CHAT_SYSTEM
from ..rag.retrieval import retrieve_qa_for_question, retrieve_diseases_for_symptoms, build_context_block
from ..safety.guardrails import detect_emergency, emergency_response, filter_unsafe_request, validate_response
from ..safety.confidence import compute_confidence
from ..safety.disclaimers import get_disclaimer


class SymptomAnalyzerAgent(BaseAgent):

    def chat(self, message: str, history: list[dict] = None) -> dict:
        history = history or []

        # Safety check #1: emergency
        is_emergency, matched = detect_emergency(message)
        if is_emergency:
            return {
                "reply": emergency_response(input_text=message),
                "sources": [],
                "confidence": 1.0,
                "flagged_emergency": True,
                "emergency_keywords": matched,
                "disclaimer": get_disclaimer(message)
            }

        # Safety check #2: unsafe request
        is_safe, reason = filter_unsafe_request(message)
        if not is_safe:
            if reason == "_crisis_support_required_":
                return {
                    "reply": emergency_response(input_text=message),
                    "sources": [],
                    "confidence": 1.0,
                    "flagged_emergency": True,
                    "disclaimer": get_disclaimer(message)
                }
            return {
                "reply": reason,
                "sources": [],
                "confidence": 0.9,
                "flagged_emergency": False,
                "disclaimer": get_disclaimer(message)
            }

        # RAG: retrieve relevant Q&As and diseases
        qa_results = retrieve_qa_for_question(message, n=4)
        disease_results = retrieve_diseases_for_symptoms(message, n=2)
        combined = qa_results + disease_results

        context_block = build_context_block(combined)

        # Build system prompt with context
        full_system = CHAT_SYSTEM
        if context_block:
            full_system += f"\n\nRelevant medical knowledge:\n{context_block}"

        # Build message history
        messages = []
        for h in history:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        reply = self.call_claude(full_system, messages)

        # Post-process: confidence and safety check
        confidence = compute_confidence(combined, reply)
        validation = validate_response(reply)

        return {
            "reply": reply,
            "sources": [
                {
                    "disease_id": r["metadata"].get("disease_id"),
                    "disease_name": r["metadata"].get("name_en"),
                    "similarity": round(r["similarity"], 3),
                    "type": r["metadata"].get("type")
                }
                for r in combined[:5]
            ],
            "confidence": round(confidence, 3),
            "flagged_emergency": False,
            "validation": validation,
            "disclaimer": get_disclaimer(message)
        }
