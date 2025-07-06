import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from io import BytesIO
from typing import Optional, Dict, Any
import json
import uuid

from video.text_to_video_generator import generate_video_by_text, get_model_status

router = APIRouter(prefix="/video")

payment_status = {}

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
        
        
        video_id = str(uuid.uuid4())
        
        
        payment_status[video_id] = {
            "video_data": video_data,
            "prompt": prompt,
            "paid": False,
            "zora_payment_tx": None
        }
        
        return StreamingResponse(
            BytesIO(video_data), 
            media_type="video/mp4",
            headers={
                "Content-Disposition": f"inline; filename=preview_video_{video_id}.mp4",
                "X-Video-ID": video_id  # Custom header to pass video ID to frontend
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in video generation: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/download")
async def download_video(
    video_id: str = Form(..., description="Video ID to download"),
    payment_verified: bool = Form(False, description="Payment verification status")
):
    """
    Download video after Zora coin payment verification
    """
    try:
        if video_id not in payment_status:
            raise HTTPException(status_code=404, detail="Video not found")
        
        video_info = payment_status[video_id]
        
        if not payment_verified:
            raise HTTPException(status_code=402, detail="Zora coin payment required for download")
        
        if not video_info["paid"]:
            raise HTTPException(status_code=402, detail="Payment not verified")
        
        video_data = video_info["video_data"]
        
        return StreamingResponse(
            BytesIO(video_data), 
            media_type="video/mp4",
            headers={
                "Content-Disposition": f"attachment; filename=generated_video_{video_id}.mp4"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@router.post("/verify-zora-payment")
async def verify_zora_payment(
    video_id: str = Form(..., description="Video ID"),
    transaction_hash: str = Form(..., description="Zora coin transaction hash"),
    amount_paid: str = Form(..., description="Amount of Zora coins paid"),
    user_address: str = Form(..., description="User's wallet address")
):
    """
    Verify Zora coin payment and enable download
    """
    try:
        if video_id not in payment_status:
            raise HTTPException(status_code=404, detail="Video not found")
        
        payment_status[video_id]["paid"] = True
        payment_status[video_id]["zora_payment_tx"] = transaction_hash
        payment_status[video_id]["amount_paid"] = amount_paid
        payment_status[video_id]["user_address"] = user_address
        
        return {
            "message": "Zora coin payment verified successfully",
            "download_available": True,
            "transaction_hash": transaction_hash
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

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
   
# TODO can be totally removed.....    
@router.post("/send-email")
async def send_video_email(
    email: str = Form(..., description="Recipient email address"),
    video: UploadFile = File(..., description="Video file to send"),
    prompt: str = Form("", description="Original prompt used for generation")
):
    """Send generated video via email using Gmail SMTP"""
    try:
        # Read video data
        video_data = await video.read()
        
        # Gmail SMTP configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = os.getenv("GMAIL_USERNAME")
        smtp_password = os.getenv("GMAIL_APP_PASSWORD")
        
        if not smtp_username or not smtp_password:
            raise HTTPException(
                status_code=500, 
                detail="Gmail configuration not set. Please configure GMAIL_USERNAME and GMAIL_APP_PASSWORD environment variables."
            )
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email
        msg['Subject'] = "Your AI-Generated Video"
        
        # Email body
        body = f"""
Hello!

Here's your AI-generated video that you requested.

Original prompt: {prompt if prompt else "No prompt provided"}

The video is attached to this email. You can download and view it on your device.

Best regards,
Your AI Video Generator
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach video
        attachment = MIMEBase('application', 'octet-stream')
        attachment.set_payload(video_data)
        encoders.encode_base64(attachment)
        attachment.add_header(
            'Content-Disposition',
            f'attachment; filename=generated_video.mp4'
        )
        msg.attach(attachment)
        
        # Send email via Gmail SMTP
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, email, text)
        server.quit()
        
        return {"message": "Video sent successfully to your email!"}
        
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")