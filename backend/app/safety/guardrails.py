"""Safety guardrails: emergency detection, query filtering, response validation."""
from ..prompts.system_prompts import EMERGENCY_KEYWORDS_EN, EMERGENCY_KEYWORDS_BN


def detect_emergency(text: str) -> tuple[bool, list[str]]:
    """Returns (is_emergency, matched_keywords)."""
    text_lower = text.lower()
    matched = []

    for kw in EMERGENCY_KEYWORDS_EN:
        if kw in text_lower:
            matched.append(kw)

    for kw in EMERGENCY_KEYWORDS_BN:
        if kw in text:
            matched.append(kw)

    return (len(matched) > 0, matched)


def emergency_response(language: str = "auto", input_text: str = "") -> str:
    """Standard emergency response message — call this when emergency is detected."""
    is_bangla = language == "bn" or any(c for c in input_text if '\u0980' <= c <= '\u09ff')

    if is_bangla:
        return (
            "⚠️ **জরুরি সতর্কতা**\n\n"
            "আপনার বর্ণনা গুরুতর হতে পারে। অবিলম্বে:\n\n"
            "• **৯৯৯ নম্বরে কল করুন** (জাতীয় জরুরি সেবা)\n"
            "• অথবা নিকটতম হাসপাতালের জরুরি বিভাগে যান\n\n"
            "ঢাকার বড় জরুরি বিভাগ: ঢাকা মেডিকেল কলেজ হাসপাতাল, স্কয়ার, এ্যাপোলো (এভারকেয়ার), ইউনাইটেড\n\n"
            "এই অ্যাপ পরে পরামর্শ দিতে পারবে — এখন চিকিৎসা সবচেয়ে গুরুত্বপূর্ণ।"
        )
    return (
        "⚠️ **EMERGENCY ALERT**\n\n"
        "Your description suggests a potential emergency. Immediately:\n\n"
        "• **Call 999** (Bangladesh National Emergency)\n"
        "• Or go to the nearest hospital emergency department\n\n"
        "Major Dhaka emergency departments: Dhaka Medical College Hospital, Square, Apollo (Evercare), United, Labaid\n\n"
        "If you are experiencing suicidal thoughts, also call Kaan Pete Roi: 9612 119911\n\n"
        "This app can help later — right now, get medical help."
    )


def filter_unsafe_request(text: str) -> tuple[bool, str | None]:
    """Detect requests for unsafe content (drug dosages, self-treatment of serious conditions, etc.)
    Returns (is_safe, reason_if_unsafe)."""

    text_lower = text.lower()

    # Specific drug + dosage requests
    unsafe_patterns = [
        ("how many", "tablet"),
        ("how many", "mg"),
        ("right dose", "of"),
        ("overdose",),
        ("how much paracetamol can my baby",),
    ]

    for pattern in unsafe_patterns:
        if all(p in text_lower for p in pattern):
            return (False, "Specific medication dosing requires a doctor's evaluation. Please consult a physician.")

    # Self-harm with method requests
    harm_indicators = ["how to kill", "how to die", "best way to commit"]
    for h in harm_indicators:
        if h in text_lower:
            return (False, "_crisis_support_required_")

    return (True, None)


def validate_response(response_text: str) -> dict:
    """Post-process AI response to check for safety issues. Returns annotation dict."""
    issues = []
    text_lower = response_text.lower()

    # Check for specific dosage recommendations (red flag)
    import re
    dosage_pattern = re.compile(r'\b\d+\s*(mg|gram|grams|ml)\s+(daily|twice|every|three times)\b', re.IGNORECASE)
    if dosage_pattern.search(response_text):
        issues.append("contains_specific_dosage")

    # Check for definitive diagnosis language
    bad_phrases = ["you have", "diagnosed with", "you are suffering from"]
    found_diagnosis_language = [p for p in bad_phrases if p in text_lower]
    if found_diagnosis_language:
        issues.append(f"diagnostic_language: {found_diagnosis_language}")

    return {
        "passed": len(issues) == 0,
        "issues": issues
    }
