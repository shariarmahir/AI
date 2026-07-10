"""Image Analyzer Agent — uses Claude vision for medical image analysis.

Handles: injury photos, prescription scans, lab reports, skin conditions.
"""
from .base import BaseAgent
from .disease_recommender import DiseaseRecommenderAgent
from ..prompts.system_prompts import IMAGE_SYSTEM
from ..safety.disclaimers import get_disclaimer
from ..safety.confidence import compute_confidence


IMAGE_PROMPTS = {
    "injury": """Analyze this image of a possible physical injury. Provide:

1. What you observe (description, not diagnosis)
2. Severity: minor / moderate / requires medical attention / emergency
3. Safe immediate first aid steps
4. When to see a doctor and which specialty
5. Red flags that mean go to ER (signs of infection, severe bleeding, neurovascular compromise)

IMPORTANT: You can't see depth, infection, or internal damage from a photo. Recommend in-person evaluation for anything beyond minor.""",

    "prescription": """This is a prescription. Extract and structure:

1. Medications: name, dose if visible, frequency, duration
2. Diagnosis or condition mentioned (if any)
3. Doctor's instructions/advice
4. Follow-up timing
5. Any warnings to flag

If handwriting is unclear, say so explicitly rather than guessing. Note which words you cannot read with confidence.""",

    "report": """This is a medical lab report. Extract and explain:

1. What tests were done
2. Key values and whether they're in normal range
3. What out-of-range values might suggest (cautiously)
4. What specialty should review this
5. Questions the patient should ask their doctor

Use plain language a non-medical person can understand. Mention Bangladesh-typical reference ranges where relevant.""",

    "skin": """This is a skin condition photo. Provide:

1. What you observe (rash characteristics, distribution, color)
2. Possible categories (NOT diagnosis): infectious, inflammatory, allergic, etc.
3. Concerning features to watch for
4. Recommended specialty (dermatologist)
5. Safe home care while waiting

Be honest about limitations — photo quality, lighting, and lack of physical exam limit accuracy.""",

    "auto": """Identify what this image shows (injury, prescription, lab report, skin condition, imaging, or other), then provide structured analysis appropriate to that type. Be clear about what you observe vs. what you infer."""
}


class ImageAnalyzerAgent(BaseAgent):

    def __init__(self):
        super().__init__()
        self.disease_recommender = DiseaseRecommenderAgent()

    def analyze(self, image_base64: str, media_type: str, image_type: str = "auto",
                user_context: str = "") -> dict:

        # Build prompt
        prompt = IMAGE_PROMPTS.get(image_type, IMAGE_PROMPTS["auto"])
        if user_context:
            prompt += f"\n\nUser context: {user_context}"

        # Call Claude vision
        analysis = self.call_claude_vision(
            system=IMAGE_SYSTEM,
            image_base64=image_base64,
            media_type=media_type,
            prompt=prompt,
            max_tokens=min(1800, self.max_tokens)
        )

        # Optional: match analysis to disease KB if it sounds like a condition
        matched_diseases = []
        if image_type in ("injury", "skin", "auto"):
            matched_diseases = self.disease_recommender.match_diseases(
                f"{user_context} {analysis}", top_n=3
            )

        # Heuristic specialty and urgency from text
        recommended_specialty = self._infer_specialty(analysis, image_type)
        urgency = self._infer_urgency(analysis)

        return {
            "analysis": analysis,
            "detected_type": image_type,
            "suggested_specialty": recommended_specialty,
            "urgency": urgency,
            "confidence": "high",
            "disclaimer": get_disclaimer(user_context)
        }

    def _infer_specialty(self, analysis: str, image_type: str) -> str:
        text = analysis.lower()
        if image_type == "prescription":
            return "follow with prescribing doctor"
        if image_type == "skin":
            return "dermatology"
        # Heuristics
        if "fracture" in text or "bone" in text:
            return "orthopedics"
        if "burn" in text:
            return "burn unit or plastic surgery"
        if "wound" in text or "laceration" in text:
            return "general surgery or emergency"
        if "infection" in text:
            return "general medicine or dermatology"
        return "general medicine"

    def _infer_urgency(self, analysis: str) -> str:
        text = analysis.lower()
        if "emergency" in text or "immediate" in text or "er " in text:
            return "emergency"
        if "urgent" in text or "soon" in text or "as soon as possible" in text:
            return "high"
        if "see a doctor" in text or "should be evaluated" in text:
            return "medium"
        return "low"
