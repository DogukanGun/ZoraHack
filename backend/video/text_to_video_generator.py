import os
from typing import Optional, Dict, Any
from huggingface_hub import InferenceClient
from utils.EnvironmentKeys import EnvironmentKeys

#This modal is being used = https://huggingface.co/Lightricks/LTX-Video-0.9.7-distilled
def generate_video_by_text(
    prompt: str,
    num_frames: int = 32,
    seed: Optional[int] = None,
    num_inference_steps: int = 7,
) -> Optional[bytes]:
    """
    Generate video using Hugging Face Inference API with Lightricks model
    
    Args:
        prompt: Text description for video generation
        num_frames: Number of frames to generate (default: 16)
        seed: Random seed for reproducibility (optional)
        num_inference_steps: Number of inference steps (default: 25)
    
    Returns:
        Video data as bytes or None if generation fails
    """
    try:
        # Get API token from environment
        api_token = os.getenv(EnvironmentKeys.HF_TOKEN.value)
        if not api_token:
            print("HF_TOKEN not found in environment variables")
            return None
        
        # Initialize the inference client with fal-ai provider
        client = InferenceClient(
            provider="fal-ai",
            api_key=api_token,
        )
        
        # Validate parameters
        if not prompt or len(prompt.strip()) == 0:
            print("Prompt cannot be empty")
            return None
        
        if len(prompt) > 500:
            print("Prompt too long (max 500 characters)")
            return None
        

            
        
        # Generate video using the Lightricks model
        video_data = client.text_to_video(
            prompt,
            model="Lightricks/LTX-Video-0.9.7-distilled",
            num_frames=num_frames,
            num_inference_steps=num_inference_steps,
            seed=seed
        )
        
        if video_data:
            print("Video generation successful")
            return video_data
        else:
            print("No video data returned")
            return None
            
    except Exception as e:
        print(f"Error in video generation: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_model_status() -> Dict[str, Any]:
    """Get the status of available models"""
    api_token = os.getenv(EnvironmentKeys.HF_TOKEN.value)
    api_status = {"available": bool(api_token)}
    
    return {
        "model": "Lightricks/LTX-Video-0.9.7-distilled",
        "provider": "fal-ai",
        "api_available": api_status["available"],
        "ready": api_status["available"]
    }