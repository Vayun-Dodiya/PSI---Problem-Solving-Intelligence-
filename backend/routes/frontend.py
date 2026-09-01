from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates


router = APIRouter()


# problem-solving-intelligence/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# problem-solving-intelligence/frontend/
FRONTEND_DIR = BASE_DIR / "frontend"


templates = Jinja2Templates(
    directory=FRONTEND_DIR
)


@router.get("/")
async def index(request: Request):
    return templates.TemplateResponse(
        name="index.html",
        
        request=request
    )


@router.get("/analyze")
async def analyze_page(request: Request):
    return templates.TemplateResponse(
        name="analyze.html",
        request=request
    )


@router.get("/profile")
async def profile_page(request: Request):
    return templates.TemplateResponse(
        name="profile.html",
        request= request
    )
