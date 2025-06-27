from fastapi import APIRouter, HTTPException
from video.text_to_video_generator import generate_video_by_text

router = APIRouter(prefix="/video")

@router.post("/")
def generate_video_by_text_endpoint(
        text: str
):
    try:
        return generate_video_by_text()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Video not found")