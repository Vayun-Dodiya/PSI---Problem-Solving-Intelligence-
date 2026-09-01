from fastapi import APIRouter, Depends, status, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database.database import get_db
from schemas.analyze import PSIRequest,PSIResponse
from services.code_analyzer import GetAnalyzeResponse

router = APIRouter(
    prefix="/api/profile",
    tags=["profile"]
)

