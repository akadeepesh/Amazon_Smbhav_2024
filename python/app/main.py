from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import detection

app = FastAPI(title="Object Detection API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(detection.router, prefix="/api", tags=["detection"])

@app.get("/")
async def root():
    return {"message": "Object Detection API is running"}