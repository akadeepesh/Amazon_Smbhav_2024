# app/models/product_models.py
from pydantic import BaseModel
from typing import List, Optional

class ProductFeature(BaseModel):
    name: str
    description: Optional[str] = None

class Product(BaseModel):
    title: str
    description: str
    features: List[str]
    estimated_price: str

class ProductGenerationResponse(BaseModel):
    status: str
    message: str
    detected_objects: List[str]
    transcription: str
    products: List[Product]