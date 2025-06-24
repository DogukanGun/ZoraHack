import io
import os
from PIL import Image
from imaginairy.api import imagine

from image.utils import read_image_from_bytes

def str_to_bool(value):
    """Convert string to boolean, handling common string representations."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ('true', '1', 'yes', 'on')
    return bool(value)

def generate_image(img_bytes: bytes, text: str) -> bytes | None:
    return generate_image_with_imaginairy(img_bytes, text)


def generate_image_with_imaginairy(img_bytes: bytes, text: str) -> bytes | None:
    """
    Generate image using Imaginairy library - CPU-friendly InstructPix2Pix implementation
    """
    try:
        print("Using Imaginairy for CPU-friendly InstructPix2Pix")
        
        # Convert bytes to PIL Image
        img_rgb, _ = read_image_from_bytes(img_bytes)
        input_image = Image.fromarray(img_rgb)
        
        # Save input image temporarily
        temp_input_path = "/tmp/input_image.jpg"
        input_image.save(temp_input_path, format='JPEG', quality=95)
        
        # Use Imaginairy's imagine function for InstructPix2Pix
        # The imagine function returns a generator, so we need to iterate through it
        results = imagine(
            prompts=text,
        )
        
        # Get the first result from the generator
        try:
            result_image = next(results)
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            result_image.save(img_byte_arr, format='JPEG', quality=95)
            img_byte_arr.seek(0)
            
            # Clean up temp file
            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)
            
            return img_byte_arr.getvalue()
            
        except StopIteration:
            print("No results from Imaginairy generator")
            # Clean up temp file
            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)
            return None
            
    except Exception as e:
        print(f"Error in Imaginairy image generation: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        
        # Clean up temp file if it exists
        temp_input_path = "/tmp/input_image.jpg"
        if os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        
        return None