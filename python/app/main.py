from fastapi import FastAPI
from app.routers import detection, audio_processing, product_generation

app = FastAPI()

# Include routers
app.include_router(detection.router, prefix="/api/v1", tags=["Detection"])
app.include_router(audio_processing.router, prefix="/api/v1", tags=["Audio Processing"])
app.include_router(product_generation.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Object Detection and Audio Processing API!"}
