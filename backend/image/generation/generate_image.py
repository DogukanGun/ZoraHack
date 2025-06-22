import torch
import io
import os
from diffusers import StableDiffusionInstructPix2PixPipeline, EulerAncestralDiscreteScheduler
from PIL import Image

from image.utils import read_image_from_bytes

# Define the path to the local model directory
LOCAL_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "instruct-pix2pix-local")

def generate_image(img_bytes: bytes, text: str) -> bytes | None:
    """
    Generate a new image based on the input image and text prompt using InstructPix2Pix.
    
    Args:
        img_bytes: Input image as bytes
        text: Text prompt for image generation
        
    Returns:
        Generated image as bytes
    """
    try:
        # Use CPU for Mac M4 compatibility
        device = "cpu"
        torch_dtype = torch.float32
        print("Using CPU with float32 for InstructPix2Pix model")
        
        # Process the input image
        img_rgb, _ = read_image_from_bytes(img_bytes)
        input_image = Image.fromarray(img_rgb)
        
        # Load InstructPix2Pix pipeline
        print(f"Loading InstructPix2Pix model from local path: {LOCAL_MODEL_PATH}")
        
        pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
            LOCAL_MODEL_PATH,
            torch_dtype=torch_dtype,
            safety_checker=None,
            requires_safety_checker=False,
            local_files_only=True  # Only use local files
        )
        
        # Move to CPU
        pipe = pipe.to(device)
        
        # Set scheduler
        pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
        
        # Enable memory optimizations
        pipe.enable_attention_slicing()
        pipe.enable_model_cpu_offload()
        
        # Generate image
        with torch.no_grad():
            # Create CPU generator
            generator = torch.Generator(device='cpu')
            generator.manual_seed(42)
            
            result = pipe(
                prompt=text,
                image=input_image,
                num_inference_steps=10,  # Reduced for faster processing
                image_guidance_scale=1.0,
                guidance_scale=7.5,
                generator=generator
            )
            
            output_image = result.images[0]
        
        # Convert PIL image to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()
        
    except Exception as e:
        print(f"Error in image generation: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        return None
