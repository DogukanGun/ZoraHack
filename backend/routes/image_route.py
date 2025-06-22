from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Form
from fastapi.responses import StreamingResponse
from io import BytesIO

from image.filter.filter_cartoon_a import apply_filter_cartoon_a
from image.filter.filter_cartoon_b import apply_filter_cartoon_b
from image.generation.generate_image import generate_image

router = APIRouter(prefix="/image")

@router.post("/generate")
async def generate_image_route(
    file: UploadFile = File(...),
    prompt: str = Form(..., description="Text prompt for image generation")
):
    """
    Generate a new image based on the input image and text prompt.
    """
    try:
        contents = await file.read()
        result_image = generate_image(contents, prompt)
        
        if result_image is None:
            raise HTTPException(status_code=500, detail="Image generation failed")
            
        return StreamingResponse(BytesIO(result_image), media_type="image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/{filter_name}")
async def apply_filter(
        filter_name: str,
        file: UploadFile = File(...),
        debug_stage: str = Query(None, description="Debug stage: original, grayscale, edges, color_reduced, blurred")
):
    contents = await file.read()

    if filter_name == "cartoon_a":
        filtered_image = apply_filter_cartoon_a(contents, debug_stage)
        return StreamingResponse(BytesIO(filtered_image), media_type="image/jpeg")
    elif filter_name == "cartoon_b":
        filtered_image = apply_filter_cartoon_b(contents, debug_stage)
        if filtered_image is None:
            raise HTTPException(status_code=404)
        return StreamingResponse(BytesIO(filtered_image), media_type="image/jpeg")
    else:
        raise HTTPException(status_code=404)

