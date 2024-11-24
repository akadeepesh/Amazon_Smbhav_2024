from fastapi import APIRouter, HTTPException
from app.models.detection_requests import Base64ImageRequest, Base64VideoRequest
from app.utils.base64_utils import decode_base64_image, decode_base64_video
from app.utils.yolo import YOLOv8Detector
import tempfile
import os
import cv2 

router = APIRouter()

# Get the YOLO model
model = YOLOv8Detector.get_model()

def process_image(image):
    """
    Detect objects in the image using YOLOv8.
    """
    results = model(image)
    detected_objects = [model.names[int(box.cls)] for box in results[0].boxes]
    return detected_objects

def process_video(video_path):
    """
    Detect objects in a video using YOLOv8.
    """
    detected_objects = set()
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Failed to open video.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        results = model(frame)
        for box in results[0].boxes:
            detected_objects.add(model.names[int(box.cls)])

    cap.release()
    return list(detected_objects)


@router.post("/detect/image")
async def detect_objects_in_image(request: Base64ImageRequest):
    """
    Detect objects in a base64-encoded image.
    """
    try:
        image = decode_base64_image(request.image_base64)
        detected_objects = process_image(image)
        return {"message": "Objects detected successfully", "detected_objects": detected_objects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@router.post("/detect/video")
async def detect_objects_in_video(request: Base64VideoRequest):
    """
    Detect objects in a base64-encoded video.
    """
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video_file:
            video_path = decode_base64_video(request.video_base64, temp_video_file.name)

        detected_objects = process_video(video_path)
        os.remove(video_path)

        return {"message": "Objects detected successfully", "detected_objects": detected_objects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")
