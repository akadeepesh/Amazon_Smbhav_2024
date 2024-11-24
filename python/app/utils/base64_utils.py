import base64
import cv2
import numpy as np
from fastapi import HTTPException

def decode_base64_image(base64_string: str) -> np.ndarray:
    """
    Decode a base64 string to an OpenCV image.
    """
    try:
        image_data = base64.b64decode(base64_string)
        np_array = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Decoded image is invalid.")
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode base64 image: {str(e)}")


def decode_base64_video(base64_string: str, output_path: str) -> str:
    """
    Decode a base64 string to a video file.
    """
    try:
        video_data = base64.b64decode(base64_string)
        with open(output_path, "wb") as video_file:
            video_file.write(video_data)
        return output_path
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to decode base64 video: {str(e)}")
