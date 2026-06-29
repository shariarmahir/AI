"""Medical disclaimers — required on all responses."""

DISCLAIMER_EN = (
    "This information is for educational purposes only and is not a substitute "
    "for professional medical advice, diagnosis, or treatment. Always consult a "
    "qualified healthcare provider. In emergencies, call 999."
)

DISCLAIMER_BN = (
    "এই তথ্য শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে এবং পেশাদার চিকিৎসা পরামর্শ, "
    "রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়। সর্বদা যোগ্য চিকিৎসকের পরামর্শ নিন। "
    "জরুরি অবস্থায় ৯৯৯ নম্বরে কল করুন।"
)


def get_disclaimer(text: str = "") -> str:
    """Return appropriate disclaimer based on input language."""
    if any(c for c in text if '\u0980' <= c <= '\u09ff'):
        return DISCLAIMER_BN
    return DISCLAIMER_EN
