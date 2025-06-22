from image.utils import read_image_from_bytes
import cv2

def apply_filter_cartoon_b(img_bytes: bytes, debug_stage: str = None) -> bytes | None:
    """
    Apply a different cartoon filter to an image.
    
    Args:
        img_bytes: Input image as bytes
        debug_stage: Optional stage to return for debugging
        
    Returns:
        Processed image as bytes
    """
    try:
        # Convert image from bytes to format opencv requires
        img_rgb, img = read_image_from_bytes(img_bytes)
        
        # Return original image if requested
        if debug_stage == "original":
            success, buffer = cv2.imencode('.jpg', img)
            return buffer.tobytes() if success else None
            
        # converting an image to grayscale
        gray_scale_image = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Return grayscale if requested
        if debug_stage == "grayscale":
            success, buffer = cv2.imencode('.jpg', gray_scale_image)
            return buffer.tobytes() if success else None
            
        # applying median blur to smoothen an image
        smooth_gray_scale = cv2.medianBlur(gray_scale_image, 5)
        
        # retrieving the edges for cartoon effect
        # by using thresholding technique
        get_edge = cv2.adaptiveThreshold(smooth_gray_scale, 255,
                                        cv2.ADAPTIVE_THRESH_MEAN_C,
                                        cv2.THRESH_BINARY, 9, 9)
                                        
        # Return edges if requested
        if debug_stage == "edges":
            success, buffer = cv2.imencode('.jpg', get_edge)
            return buffer.tobytes() if success else None
            
        # applying bilateral filter to remove noise
        # and keep edge sharp as required
        color_image = cv2.bilateralFilter(img, 9, 300, 300)
        
        # Return color-reduced image if requested
        if debug_stage == "color_reduced":
            success, buffer = cv2.imencode('.jpg', color_image)
            return buffer.tobytes() if success else None
            
        # Return blurred image if requested
        if debug_stage == "blurred":
            success, buffer = cv2.imencode('.jpg', color_image)
            return buffer.tobytes() if success else None
            
        # masking edged image with our "BEAUTIFY" image
        cartoon_image = cv2.bitwise_and(color_image, color_image, mask=get_edge)
        
        # Encode the image to jpg format
        success, buffer = cv2.imencode('.jpg', cartoon_image)
        return buffer.tobytes() if success else None
        
    except Exception as e:
        print(f"Error in cartoon filter B: {e}")
        return None