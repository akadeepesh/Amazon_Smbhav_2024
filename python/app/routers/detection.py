# app/routers/detection.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import shutil
import os
import requests
import re
from pydantic import BaseModel, HttpUrl, validator
import cv2
import numpy as np
from pytube import YouTube
from ..utils.detector import Detector
from pytube import YouTube
from pathlib import Path
import logging
import time

router = APIRouter()
detector = Detector()

# Ensure input and output directories exist
INPUT_DIR = Path("input")
OUTPUT_DIR = Path("output")
INPUT_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImageURL(BaseModel):
    url: HttpUrl

def download_image(url: str) -> str:
    """Download image from URL and save it locally"""
    try:
        # Generate a filename from the URL
        filename = f"downloaded_{hash(url)}.jpg"
        input_path = INPUT_DIR / filename
        
        # Download the image
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Convert to opencv format directly from response content
        image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        # Save the image locally
        cv2.imwrite(str(input_path), image)
        
        return str(input_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download image: {str(e)}")

@router.post("/detect/image/url")
async def detect_image_from_url(image_url: ImageURL):
    """
    Process an image from URL and return the detected objects
    """
    try:
        # Download the image
        input_path = download_image(str(image_url.url))
        
        # Process image
        output_image, detections = detector.process_image(input_path)
        
        # Save output image
        output_filename = f"processed_{Path(input_path).name}"
        output_path = OUTPUT_DIR / output_filename
        cv2.imwrite(str(output_path), output_image)
        
        return {
            "message": "Image processed successfully",
            "detections": detections,
            "output_path": str(output_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup input file
        if input_path and os.path.exists(input_path):
            os.remove(input_path)

@router.post("/detect/image/file")
async def detect_image_from_file(file: UploadFile = File(...)):
    """
    Process an image file upload and return the detected objects
    """
    # Save uploaded file
    input_path = INPUT_DIR / file.filename
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Process image
        output_image, detections = detector.process_image(str(input_path))
        
        # Save output image
        output_path = OUTPUT_DIR / f"processed_{file.filename}"
        cv2.imwrite(str(output_path), output_image)
        
        return {
            "message": "Image processed successfully",
            "detections": detections,
            "output_path": str(output_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup input file
        os.remove(input_path)

class VideoRequest(BaseModel):
    url: str
    save_frames: bool = False
    resolution: str = "720p"  # Default resolution
    
    @validator('url')
    def validate_url(cls, v):
        # Check if it's a valid YouTube URL
        youtube_regex = r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
        if re.match(youtube_regex, v):
            return v
        
        # If not YouTube, check if it's a valid URL
        try:
            response = requests.head(v)
            response.raise_for_status()
            return v
        except:
            raise ValueError('Invalid URL provided')
def download_youtube_video(url: str, resolution: str = "720p", max_retries: int = 3) -> str:
    """
    Download video from YouTube URL with enhanced error handling and retries
    
    Args:
        url: YouTube video URL
        resolution: Desired video resolution (default "720p")
        max_retries: Maximum number of download attempts (default 3)
    
    Returns:
        str: Path to downloaded video file
    
    Raises:
        HTTPException: If download fails after all retries
    """
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to download video from {url} (Attempt {attempt + 1}/{max_retries})")
            
            # Create YouTube object with additional options
            yt = YouTube(
                url,
                use_oauth=False,
                allow_oauth_cache=False,
                on_progress_callback=lambda stream, chunk, bytes_remaining: logger.debug(
                    f"Downloaded {stream.filesize - bytes_remaining} of {stream.filesize} bytes"
                )
            )
            
            # Wait briefly for connection to initialize
            time.sleep(1)
            
            # Log available streams for debugging
            logger.info("Available streams:")
            for stream in yt.streams.filter(progressive=True, file_extension='mp4'):
                logger.info(f"- Resolution: {stream.resolution}, FPS: {stream.fps}, Size: {stream.filesize_mb:.1f}MB")
            
            # Get the video stream
            stream = yt.streams.filter(
                progressive=True,
                file_extension='mp4',
                resolution=resolution
            ).first()
            
            # Fallback to highest available resolution
            if not stream:
                logger.warning(f"Requested resolution {resolution} not available. Falling back to highest available.")
                stream = yt.streams.filter(
                    progressive=True,
                    file_extension='mp4'
                ).order_by('resolution').desc().first()
                
                if not stream:
                    raise ValueError(f"No suitable video streams found for {url}")
            
            # Generate filename and ensure directory exists
            filename = f"youtube_{yt.video_id}.mp4"
            INPUT_DIR.mkdir(parents=True, exist_ok=True)
            output_path = INPUT_DIR / filename
            
            logger.info(f"Downloading video: {yt.title} ({stream.resolution})")
            logger.info(f"Output path: {output_path}")
            
            # Download the video
            stream.download(output_path=str(INPUT_DIR), filename=filename)
            
            if output_path.exists():
                logger.info(f"Successfully downloaded video to {output_path}")
                return str(output_path)
            else:
                raise FileNotFoundError(f"Download completed but file not found at {output_path}")
            
        except Exception as e:
            logger.error(f"Download attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "Failed to download YouTube video",
                        "url": url,
                        "attempted_resolution": resolution,
                        "reason": str(e)
                    }
                )
            time.sleep(2 ** attempt)  # Exponential backoff between retries
            
    # This shouldn't be reached due to the exception in the loop
    raise HTTPException(status_code=400, detail="Failed to download video after all retries")


def download_video(url: str) -> str:
    """Download video from direct URL"""
    try:
        filename = f"downloaded_{hash(url)}.mp4"
        input_path = INPUT_DIR / filename
        
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(input_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        return str(input_path)
    except Exception as e:
        raise HTTPException(status_code=400, 
                          detail=f"Failed to download video: {str(e)}")

@router.post("/detect/video/url")
async def detect_video_from_url(video_request: VideoRequest):
    """
    Process a video from URL (including YouTube) and return the processed video path
    """
    input_path = None
    try:
        # Check if it's a YouTube URL
        youtube_regex = r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
        if re.match(youtube_regex, video_request.url):
            input_path = download_youtube_video(video_request.url, 
                                              video_request.resolution)
        else:
            input_path = download_video(video_request.url)
        
        # Process video
        output_filename = f"processed_{Path(input_path).name}"
        output_path = OUTPUT_DIR / output_filename
        
        processed_path = detector.process_video(
            str(input_path), 
            str(output_path),
            video_request.save_frames
        )
        
        return {
            "message": "Video processed successfully",
            "output_path": str(processed_path),
            "processed_file": output_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup input file
        if input_path and os.path.exists(input_path):
            os.remove(input_path)

# Add endpoint to get video processing status
@router.get("/video/status/{filename}")
async def get_video_status(filename: str):
    """
    Check if a processed video is ready
    """
    file_path = OUTPUT_DIR / filename
    if file_path.exists():
        return {"status": "completed", "file_ready": True}
    return {"status": "processing", "file_ready": False}

# Add endpoint to get the processed video
@router.get("/video/{filename}")
async def get_video(filename: str):
    """
    Retrieve a processed video by filename
    """
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path, media_type="video/mp4")
# Optional: Add endpoint to get the processed image
@router.get("/image/{filename}")
async def get_image(filename: str):
    """
    Retrieve a processed image by filename
    """
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)