"""Hospital search endpoint."""
from fastapi import APIRouter, HTTPException
from ..schemas.models import HospitalSearchRequest, HospitalSearchResponse, HospitalSuggestion
from ..agents import HospitalFinderAgent

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])
_agent = None


def get_agent() -> HospitalFinderAgent:
    global _agent
    if _agent is None:
        _agent = HospitalFinderAgent()
    return _agent


@router.post("/search", response_model=HospitalSearchResponse)
async def search(request: HospitalSearchRequest):
    try:
        agent = get_agent()
        hospitals_raw = agent.find_nearby(
            lat=request.lat, lng=request.lng,
            specialty=request.specialty, radius_meters=request.radius_meters
        )
        hospitals = [HospitalSuggestion(**h) for h in hospitals_raw]
        return HospitalSearchResponse(
            hospitals=hospitals,
            search_specialty=request.specialty
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
