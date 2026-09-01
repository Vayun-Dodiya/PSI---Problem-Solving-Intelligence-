from fastapi import APIRouter, Depends, status, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database.database import get_db
from schemas.analyze import PSIRequest,PSIResponse
from services.code_analyzer import GetAnalyzeResponse

router = APIRouter(
    prefix="/api/analyze",
    tags=["analyze"]
)


# Serve the CSS files at /analyze/static/*.
# router.mount("/frontend", StaticFiles(directory="frontend"), name="static")
# templates = Jinja2Templates(directory="templates")

# router.mount("/static", StaticFiles(directory="static"), name="static")
# templates = Jinja2Templates(directory="templates")

# @router.get("/in")
# def testGet(request_:Request):
    # return templates.TemplateResponse(name="index.html", request=request_)

@router.get("/")
def home():
    return {"message":"Hello World"}

@router.post("/ana")
def askGenerate(PromptRequest : PSIRequest) -> PSIResponse:
    gemini_responce =  GetAnalyzeResponse(language=PromptRequest.language,code=PromptRequest.code,prompt=PromptRequest.prompt) 
    return gemini_responce