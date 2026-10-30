import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import Base, engine
from app.routers import auth, students, assessments, predictions, recommendations, admin

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("placepilot")

# Initialize SQLite database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PlacePilot API",
    description="AI-Powered Campus Placement Prediction & Skill Readiness System Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
if "*" not in origins:
    origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(assessments.router)
app.include_router(predictions.router)
app.include_router(recommendations.router)
app.include_router(admin.router)

@app.get("/api/health", tags=["General"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "operational"
    }

# Mount Frontend Production Build (SPA)
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    def serve_frontend_spa(full_path: str):
        # Don't intercept API or Docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/", tags=["General"])
    def root():
        return {
            "name": "PlacePilot API",
            "version": "1.0.0",
            "status": "online",
            "documentation": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
