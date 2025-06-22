import cv2
import numpy as np

from image.utils import read_image_from_bytes


def apply_filter_cartoon_a(img_bytes: bytes, debug_stage: str = None) -> bytes | None:
    """
    Apply cartoon filter to an image using KMeans clustering for color quantization
    and edge detection for the cartoon effect.
    
    Args:
        img_bytes: Input image as bytes
        debug_stage: Optional stage to return for debugging
        
    Returns:
        Processed image as bytes
    """
    # Convert image from bytes to format opencv requires
    img_rgb,img = read_image_from_bytes(img_bytes)
    
    # Return original image if requested
    if debug_stage == "original":
        success, buffer = cv2.imencode('.jpg', img)
        return buffer.tobytes() if success else None
    
    # Step 1: Edge detection
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Return grayscale if requested
    if debug_stage == "grayscale":
        success, buffer = cv2.imencode('.jpg', gray)
        return buffer.tobytes() if success else None
    
    # Apply median blur to reduce noise
    gray_blur = cv2.medianBlur(gray, 5)
    
    # Apply adaptive thresholding for edge detection
    edges = cv2.adaptiveThreshold(
        gray_blur, 
        255, 
        cv2.ADAPTIVE_THRESH_MEAN_C, 
        cv2.THRESH_BINARY, 
        9, 
        5
    )
    
    # Return edges if requested
    if debug_stage == "edges":
        success, buffer = cv2.imencode('.jpg', edges)
        return buffer.tobytes() if success else None
    
    # Step 2: Color quantization using KMeans
    try:
        # Resize image if too large to avoid memory issues
        h, w = img_rgb.shape[:2]
        
        # Process the original image directly
        # Reshape the image for KMeans
        data = img_rgb.reshape((-1, 3))
        data = np.float32(data)
        
        # Define criteria and apply KMeans
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 0.001)
        k = 8  # Number of clusters/colors
        _, labels, centers = cv2.kmeans(
            data, 
            k, 
            None, 
            criteria, 
            10, 
            cv2.KMEANS_RANDOM_CENTERS
        )
        
        # Convert back to uint8
        centers = np.uint8(centers)
        
        # Map labels to centers
        result = centers[labels.flatten()]
        
        # Reshape back to original image dimensions
        result = result.reshape(img_rgb.shape)
        
        # Return color-quantized image if requested
        if debug_stage == "color_reduced":
            result_bgr = cv2.cvtColor(result, cv2.COLOR_RGB2BGR)
            success, buffer = cv2.imencode('.jpg', result_bgr)
            return buffer.tobytes() if success else None
        
        # Step 3: Apply bilateral filter for smoothing
        smoothed = cv2.bilateralFilter(result, d=9, sigmaColor=300, sigmaSpace=300)
        
        # Return smoothed image if requested
        if debug_stage == "blurred":
            smoothed_bgr = cv2.cvtColor(smoothed, cv2.COLOR_RGB2BGR)
            success, buffer = cv2.imencode('.jpg', smoothed_bgr)
            return buffer.tobytes() if success else None
        
        # Step 4: Combine color image with edges
        cartoon = cv2.bitwise_and(smoothed, smoothed, mask=edges)
        
        # Convert back to BGR for OpenCV
        cartoon_bgr = cv2.cvtColor(cartoon, cv2.COLOR_RGB2BGR)
        
        # Return final image
        success, buffer = cv2.imencode('.jpg', cartoon_bgr)
        return buffer.tobytes() if success else None
        
    except Exception as e:
        print(f"Error in cartoon filter: {e}")
        # Return original image if processing fails
        success, buffer = cv2.imencode('.jpg', img)
        return buffer.tobytes() if success else None