# app/routers/product_generation.py
from fastapi import APIRouter, HTTPException
from typing import List, Dict
import httpx
from app.utils.product_utils import ProductGenerator
from app.models.detection_requests import Base64VideoRequest

router = APIRouter()
product_generator = ProductGenerator()

@router.post("/generate/products")
async def generate_products_from_video(request: Base64VideoRequest):
    """
    Generate product listings from video content
    """
    try:
        # Make request to object detection endpoint
        async with httpx.AsyncClient() as client:
            detect_response = await client.post(
                "http://127.0.0.1:8000/api/v1/detect/video",
                json={"video_base64": request.video_base64}
            )
            detect_data = detect_response.json()
            print(detect_data)
            detected_objects = detect_data.get("detected_objects", [])

        # Make request to audio processing endpoint
        async with httpx.AsyncClient() as client:
            audio_response = await client.post(
                "http://127.0.0.1:8000/api/v1/process/audio",
                json={"video_base64": request.video_base64}
            )
            audio_data = audio_response.json()
            transcription = audio_data.get("transcription", "")

        # Generate product listings
        product_listings = product_generator.generate_product_listing(detected_objects, transcription)
        
        # Validate products
        validated_products = product_generator.validate_product_listing(product_listings)

        return {
            "status": "success",
            "message": "Product listings generated successfully",
            "detected_objects": detected_objects,
            "transcription": transcription,
            "products": validated_products
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating product listings: {str(e)}"
        )