import base64
from io import BytesIO
import speech_recognition as sr
import ffmpeg
import tempfile
import os

def extract_audio_from_base64_video(video_base64: str) -> BytesIO:
    """
    Extract audio from a base64-encoded video file using ffmpeg.
    """
    try:
        # Decode base64 video
        video_bytes = base64.b64decode(video_base64)
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
                temp_video_path = temp_video.name
                temp_audio_path = temp_audio.name
                
        # Write video bytes to temporary file
        with open(temp_video_path, 'wb') as f:
            f.write(video_bytes)
            
        try:
            # Use ffmpeg to extract audio
            stream = ffmpeg.input(temp_video_path)
            stream = ffmpeg.output(stream, temp_audio_path, acodec='pcm_s16le', ac=1, ar='16k')
            ffmpeg.run(stream, capture_stdout=True, capture_stderr=True, overwrite_output=True)
            
            # Read the processed audio into a buffer
            with open(temp_audio_path, 'rb') as f:
                audio_buffer = BytesIO(f.read())
                
            return audio_buffer
            
        finally:
            # Cleanup temporary files
            if os.path.exists(temp_video_path):
                os.unlink(temp_video_path)
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                
    except Exception as e:
        raise Exception(f"Failed to extract audio from video: {str(e)}")

def transcribe_audio_to_text(audio_stream: BytesIO) -> str:
    """
    Transcribe audio stream to text using speech recognition.
    """
    try:
        recognizer = sr.Recognizer()
        
        # Create temporary audio file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            temp_audio.write(audio_stream.getvalue())
            temp_audio_path = temp_audio.name
            
        try:
            # Load and transcribe the audio
            with sr.AudioFile(temp_audio_path) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(audio_data)
                return text
                
        finally:
            # Cleanup
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                
    except sr.UnknownValueError:
        raise Exception("Speech recognition could not understand the audio")
    except sr.RequestError as e:
        raise Exception(f"Could not request results from speech recognition service: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to transcribe audio: {str(e)}")