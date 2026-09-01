from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from database.database import engine, Base
from routes import analyze, profile, frontend

from dotenv import load_dotenv


# Load environment variables
load_dotenv()


# --------------------------------------------------
# Create app
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# Database
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# Paths
# --------------------------------------------------

# backend/main.py
#       ↓
# backend/
#       ↓
# problem-solving-intelligence/
BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"


# --------------------------------------------------
# Static files
# --------------------------------------------------

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)


# --------------------------------------------------
# API routes
# --------------------------------------------------

app.include_router(analyze.router)
app.include_router(profile.router)


# --------------------------------------------------
# Frontend routes
# --------------------------------------------------

app.include_router(frontend.router)
