"""Pydantic schemas for API contracts."""
from pydantic import BaseModel, Field
from typing import Optional, Literal


# ─────── Chat ───────
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = []
    language: Literal["en", "bn", "auto"] = "auto"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sources: list[dict] = []
    confidence: float
    flagged_emergency: bool = False
    disclaimer: str
    session_id: Optional[str] = None


# ─────── Triage ───────
class TriageRequest(BaseModel):
    symptoms: str = Field(..., min_length=3, max_length=2000)
    lat: Optional[float] = None
    lng: Optional[float] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Literal["female", "male", "other"] = "female"
    duration_days: Optional[int] = None
    pregnant: Optional[bool] = None


class HospitalSuggestion(BaseModel):
    name: str
    address: str
    rating: Optional[float]
    total_ratings: int
    open_now: Optional[bool]
    location: dict
    place_id: str
    maps_url: str
    distance_meters: Optional[int] = None

    # Populated by the local dataset fallback. Google Places does not return
    # these, so they keep their defaults on the live path.
    source: Literal["google", "local"] = "google"
    phone: Optional[str] = None
    emergency_24_7: Optional[bool] = None
    has_ambulance: Optional[bool] = None
    specialties: list[str] = []


class TriageResponse(BaseModel):
    specialty: str
    urgency: Literal["low", "medium", "high", "emergency"]
    summary: str
    possible_conditions: list[str]
    matched_diseases: list[dict] = []
    risk_factors: list[str]
    red_flags: list[str]
    self_care: list[str]
    questions_for_doctor: list[str]
    hospitals: list[HospitalSuggestion] = []
    confidence: Literal["high", "medium", "low"] = "medium"
    flagged_emergency: bool = False
    disclaimer: str


# ─────── Image analysis ───────
class ImageAnalysisResponse(BaseModel):
    analysis: str
    detected_type: str
    suggested_specialty: Optional[str] = None
    # "unknown" is used when the vision model could not read the image, so a
    # refusal is never surfaced to the user as a confident emergency.
    urgency: Literal["low", "medium", "high", "emergency", "unknown"] = "low"
    confidence: Literal["high", "medium", "low"] = "high"
    disclaimer: str


# ─────── Hospital search ───────
class HospitalSearchRequest(BaseModel):
    lat: float
    lng: float
    specialty: str = "hospital"
    radius_meters: int = Field(default=8000, ge=500, le=50000)


class HospitalSearchResponse(BaseModel):
    hospitals: list[HospitalSuggestion]
    search_specialty: str


# ─────── Disease lookup ───────
class DiseaseInfo(BaseModel):
    id: str
    name_en: str
    name_bn: str
    category: str
    summary: str
    symptoms: list[str]
    causes: list[str]
    risk_factors: list[str]
    complications: list[str]
    red_flags: list[str]
    treatment_overview: str
    prevention: list[str]
    bd_context: str
    specialty: str


# ─────── Health check ───────
class HealthCheck(BaseModel):
    status: str
    model: str
    rag_documents: int
    diseases_loaded: int
    embedding_model: str
