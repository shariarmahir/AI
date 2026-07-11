"""Image analysis endpoint."""
import base64
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from ..schemas.models import ImageAnalysisResponse
from ..agents import ImageAnalyzerAgent

router = APIRouter(prefix="/api/image", tags=["image"])
_agent = None


def get_agent() -> ImageAnalyzerAgent:
    global _agent
    if _agent is None:
        _agent = ImageAnalyzerAgent()
    return _agent


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(
    image: UploadFile = File(...),
    image_type: str = Form("auto"),
    context: str = Form("")
):
    if image_type not in ("injury", "prescription", "report", "skin", "medicine", "auto"):
        raise HTTPException(status_code=400, detail="image_type must be one of: injury, prescription, report, skin, medicine, auto")

    try:
        content = await image.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

        b64 = base64.b64encode(content).decode()
        media_type = image.content_type or "image/jpeg"

        agent = get_agent()
        result = agent.analyze(
            image_base64=b64,
            media_type=media_type,
            image_type=image_type,
            user_context=context
        )

        return ImageAnalysisResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
