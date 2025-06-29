from fastapi import APIRouter, HTTPException, Form, Body
from fastapi.responses import StreamingResponse
from io import BytesIO
from typing import Optional, Dict, Any
import json

from video.text_to_video_generator import generate_video_by_text, get_model_status

router = APIRouter(prefix="/video")

@router.get("/status")
async def get_video_model_status():
    """
    Get the status of available video generation models
    """
    return get_model_status()

@router.post("/generate")
async def generate_video_by_text_endpoint(
    prompt: str = Form(..., description="Text prompt for video generation"),
    num_frames: int = Form(32, description="Number of frames"),
    num_inference_steps: int = Form(7, description="Number of inference steps"),
    seed: Optional[int] = Form(None, description="Random seed")
):
    """
    Generate video using specified parameters
    """
    try:
        if not prompt or len(prompt.strip()) == 0:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
        
        if len(prompt) > 500:
            raise HTTPException(status_code=400, detail="Prompt too long (max 500 characters)")
        
        print(f"Received video generation request: {prompt}")
        
        # Generate video with specified parameters
        video_data = generate_video_by_text(
            prompt=prompt,
            num_frames=num_frames,
            seed=seed,
            num_inference_steps=num_inference_steps
        )
        
        if video_data is None:
            raise HTTPException(status_code=500, detail="Video generation failed")
        
        # Return video as streaming response
        return StreamingResponse(
            BytesIO(video_data), 
            media_type="video/mp4",
            headers={
                "Content-Disposition": f"attachment; filename=generated_video.mp4"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in video generation: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



@router.get("/health")
async def video_health_check():
    """
    Health check endpoint for video service
    """
    status = get_model_status()
    return {
        "status": "healthy" if status["ready"] else "degraded",
        "service": "video-generation",
        "model": "Lightricks/LTX-Video-0.9.7-distilled",
        "provider": "fal-ai",
        "api_available": status["api_available"]
    }