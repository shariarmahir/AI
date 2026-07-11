"""Image Analyzer Agent — uses Claude vision for medical image analysis.

Handles: injury photos, prescription scans, lab reports, skin conditions.
"""
from .base import BaseAgent
from .disease_recommender import DiseaseRecommenderAgent
from ..prompts.system_prompts import IMAGE_SYSTEM
from ..safety.disclaimers import get_disclaimer
from ..safety.confidence import compute_confidence


IMAGE_PROMPTS = {
    "injury": """Look carefully at this photo of an injury and describe exactly what you can see.

Start by describing the visible findings: where the injury is, its approximate size, the colour
of the wound and the skin around it, the wound edges, any swelling, bleeding, discharge, bruising,
or signs of infection (spreading redness, pus, dark tissue).

Then give:
1. What this could suggest (cautiously — not a diagnosis)
2. Severity: minor / moderate / requires medical attention / emergency
3. Safe immediate first aid steps
4. When to see a doctor and which specialty
5. Red flags that mean go to hospital or call 999 (spreading infection, heavy bleeding,
   numbness, deep wound, dirty/rusty object, animal or snake bite)

Do not refuse. Describe what is visible. You cannot judge depth or internal damage from a photo —
say so, and recommend in-person evaluation for anything beyond minor.""",

    "prescription": """Read this prescription and extract everything you can see.

List every medicine you can make out, with:
- Name (brand and/or generic)
- Dose (mg/ml) if visible
- Frequency (how many times a day)
- Duration (how many days)
- What it is commonly used for

Then give: the condition or diagnosis written (if any), the doctor's instructions, follow-up
timing, and any warnings (interactions, food restrictions, things to avoid).

Read out the text you can see, even partially. If handwriting is unclear, state exactly which
words you cannot read — never guess a medicine name.""",

    "report": """Read this medical lab report and explain it in plain language.

For every test you can see, give:
- Test name
- The patient's value
- The normal reference range
- Whether it is HIGH, LOW, or NORMAL

Then explain, cautiously, what any out-of-range values could suggest, which specialty should
review this report, and what questions the patient should ask their doctor.

Read the actual values printed on the report. Use language a non-medical person understands.""",

    "medicine": """Look at this photo of a medicine (tablet, capsule, strip, bottle, or packet).

Describe what you can see: the name printed, manufacturer, strength (mg), batch number, expiry
date, and the physical appearance of the medicine itself.

Then give:
1. What this medicine is and what it treats
2. How it is normally taken
3. Common side effects
4. Important warnings (who should not take it)
5. COUNTERFEIT CHECK — look carefully for signs of a fake medicine: blurry or poor-quality
   printing, spelling mistakes, missing or unreadable batch number or expiry date, a broken or
   tampered seal, unusual colour or texture, or packaging that looks inconsistent.

If you cannot read the name clearly, say so and describe what is visible instead of guessing.""",

    "skin": """Look at this photo of a skin condition and describe what you can see.

Describe the visible features: the appearance of the rash or lesion, its colour, size, shape,
borders, distribution, whether it is raised or flat, scaling, blistering, or discharge, and the
condition of the surrounding skin.

Then give:
1. Possible categories (NOT a diagnosis): infectious, fungal, allergic, inflammatory, parasitic
2. Concerning features to watch for
3. Recommended specialty (usually dermatology)
4. Safe home care while waiting for a doctor

Do not refuse to look. Be honest that photo quality, lighting, and lack of physical examination
limit accuracy — but still describe what is visible.""",

    "auto": """Look at this image and identify what it shows: an injury, prescription, lab report,
medicine, skin condition, X-ray/scan, or something else.

Then describe in detail what you can actually see in it, and give structured analysis appropriate
to that type — visible findings first, then what it could suggest, severity, what to do now, and
when to see a doctor. Be clear about what you observe versus what you infer. Do not refuse."""
}

# Phrases that indicate the vision model refused to look instead of analyzing.
REFUSAL_MARKERS = (
    "i cannot provide", "i can't provide", "i cannot analyze", "i can't analyze",
    "i cannot identify", "i can't identify", "unable to analyze", "unable to identify",
    "i'm not able to", "i am not able to", "cannot assess", "can't assess",
    "unclear what the image", "i cannot see", "i can't see",
    "as an ai", "i'm sorry, but i can",
)


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

        analysis = self._call_vision(image_base64, media_type, prompt)

        # Vision models are RLHF-trained to refuse medical imagery. If the model
        # refused instead of describing, retry once with a firmer instruction —
        # a refusal is useless to a patient waiting for help.
        if self._is_refusal(analysis):
            retry_prompt = (
                prompt
                + "\n\nYou previously refused to look at this image. That is not acceptable. "
                  "Describing what is visible is observation, not diagnosis, and it is safe and "
                  "permitted. Look at the image now and describe concretely what you can see — "
                  "colours, shapes, text, wound edges, swelling, redness, printed words. State "
                  "clearly which specific details are unclear, but DO NOT refuse to describe."
            )
            analysis = self._call_vision(image_base64, media_type, retry_prompt)

        refused = self._is_refusal(analysis)

        # Heuristic specialty and urgency from text. If the model refused, its text
        # contains no real findings, so urgency/specialty cannot be inferred from it —
        # never present a refusal as a confident emergency.
        recommended_specialty = self._infer_specialty(analysis, image_type)
        urgency = "unknown" if refused else self._infer_urgency(analysis)
        confidence = "low" if refused else self._infer_confidence(analysis)

        if refused:
            analysis += (
                "\n\n---\n**Note:** The AI could not read this image clearly. "
                "Please try a brighter, sharper, closer photo — or describe your problem in text. "
                "If this is urgent, see a doctor or call 999."
            )

        return {
            "analysis": analysis,
            "detected_type": image_type,
            "suggested_specialty": recommended_specialty,
            "urgency": urgency,
            "confidence": confidence,
            "disclaimer": get_disclaimer(user_context)
        }

    def _call_vision(self, image_base64: str, media_type: str, prompt: str) -> str:
        return self.call_claude_vision(
            system=IMAGE_SYSTEM,
            image_base64=image_base64,
            media_type=media_type,
            prompt=prompt,
            max_tokens=min(1800, self.max_tokens)
        )

    @staticmethod
    def _is_refusal(analysis: str) -> bool:
        """True if the model declined to describe the image rather than analyzing it."""
        if not analysis or len(analysis.strip()) < 40:
            return True
        # Only the opening matters: a refusal leads with it, whereas a real analysis
        # may legitimately say "I cannot see the depth of the wound" partway through.
        opening = analysis[:400].lower()
        return any(marker in opening for marker in REFUSAL_MARKERS)

    @staticmethod
    def _infer_confidence(analysis: str) -> str:
        """Confidence in the visual read, based on how hedged/short the output is."""
        text = analysis.lower()
        hedges = ("unclear", "cannot tell", "hard to tell", "difficult to determine",
                  "blurry", "low quality", "cannot be certain", "not clear")
        hits = sum(1 for h in hedges if h in text)
        if hits >= 3 or len(analysis) < 300:
            return "low"
        if hits >= 1:
            return "medium"
        return "high"

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
        """Infer urgency from the analysis text.

        Matches on decisive phrases only. Bare words like "immediate" or "er" were
        previously matching benign advice ("immediately clean the wound") and firing
        a false emergency, so they are not used.
        """
        text = analysis.lower()

        emergency_phrases = (
            "call 999", "৯৯৯", "999 e call", "emergency room", "go to the emergency",
            "severity: emergency", "seek emergency", "immediate medical attention",
            "immediately go to", "life-threatening", "call an ambulance",
        )
        if any(p in text for p in emergency_phrases):
            return "emergency"

        high_phrases = (
            "requires medical attention", "urgent", "as soon as possible",
            "within 24 hours", "same day", "seek medical care promptly", "do not delay",
        )
        if any(p in text for p in high_phrases):
            return "high"

        medium_phrases = (
            "see a doctor", "should be evaluated", "consult a", "visit a clinic",
            "severity: moderate", "moderate",
        )
        if any(p in text for p in medium_phrases):
            return "medium"

        return "low"
