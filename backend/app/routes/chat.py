"""Chat endpoint."""
from fastapi import APIRouter, HTTPException
from ..schemas.models import ChatRequest, ChatResponse
from ..agents import SymptomAnalyzerAgent

router = APIRouter(prefix="/api/chat", tags=["chat"])
_agent = None


def get_agent() -> SymptomAnalyzerAgent:
    global _agent
    if _agent is None:
        _agent = SymptomAnalyzerAgent()
    return _agent


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        agent = get_agent()
        history_dicts = [{"role": m.role, "content": m.content} for m in request.history]
        result = agent.chat(request.message, history=history_dicts)

        return ChatResponse(
            reply=result["reply"],
            sources=result.get("sources", []),
            confidence=result["confidence"],
            flagged_emergency=result.get("flagged_emergency", False),
            disclaimer=result["disclaimer"],
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
