"""Triage endpoint - the demo gold."""
from fastapi import APIRouter, HTTPException
from ..schemas.models import TriageRequest, TriageResponse, HospitalSuggestion
from ..agents import TriageAgent

router = APIRouter(prefix="/api/triage", tags=["triage"])
_agent = None


def get_agent() -> TriageAgent:
    global _agent
    if _agent is None:
        _agent = TriageAgent()
    return _agent


@router.post("", response_model=TriageResponse)
async def triage(request: TriageRequest):
    try:
        agent = get_agent()
        result = agent.triage(
            symptoms=request.symptoms,
            lat=request.lat,
            lng=request.lng,
            age=request.age,
            gender=request.gender,
            duration_days=request.duration_days,
            pregnant=request.pregnant
        )

        # Convert hospital dicts to HospitalSuggestion models
        hospitals = [HospitalSuggestion(**h) for h in result.get("hospitals", [])]

        return TriageResponse(
            specialty=result.get("specialty", "general medicine"),
            urgency=result.get("urgency", "medium"),
            summary=result.get("summary", ""),
            possible_conditions=result.get("possible_conditions", []),
            matched_diseases=result.get("matched_diseases", []),
            risk_factors=result.get("risk_factors", []),
            red_flags=result.get("red_flags", []),
            self_care=result.get("self_care", []),
            questions_for_doctor=result.get("questions_for_doctor", []),
            hospitals=hospitals,
            confidence=result.get("confidence", 0.5),
            flagged_emergency=result.get("flagged_emergency", False),
            disclaimer=result["disclaimer"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
