import cv2
import numpy as np


def read_image_from_bytes(img_bytes: bytes)->cv2.typing.MatLike:
    # Load image from bytes
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        return None

    # Convert BGR to RGB for better visualization
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB),img