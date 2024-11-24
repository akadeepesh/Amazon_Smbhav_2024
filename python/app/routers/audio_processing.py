from fastapi import APIRouter, HTTPException
from app.models.detection_requests import Base64VideoRequest
from app.utils.audio_utils import extract_audio_from_base64_video, transcribe_audio_to_text

router = APIRouter()

@router.post("/process/audio")
async def process_audio_from_video(request: Base64VideoRequest):
    """
    Extract audio from a base64-encoded video and transcribe it to text.
    """
    try:
        # Validate base64 input
        if not request.video_base64:
            raise HTTPException(status_code=400, detail="No video data provided")
            
        # Extract audio from base64 video
        audio_stream = extract_audio_from_base64_video(request.video_base64)
        
        # Transcribe the extracted audio
        transcription = transcribe_audio_to_text(audio_stream)
        
        return {
            "status": "success",
            "message": "Audio processed successfully",
            "transcription": transcription
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio: {str(e)}"
        )