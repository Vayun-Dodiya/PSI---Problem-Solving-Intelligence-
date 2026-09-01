from pydantic import BaseModel, Field


class AIResponse(BaseModel):
    intent: str
    approach_summary: str
    mistake_identified: str
    why_incorrect: str
    misunderstood_concepts: list[str]
    hint: str
    correct_code_provided: bool
    corrected_code: str
    confidence: float = Field(ge=0.0, le=1.0)


class ErrorResponse(BaseModel):
    code: str
    message: str


class PSIRequest(BaseModel):
    prompt: str
    code: str
    language: str
    mode: str


class PSIResponse(BaseModel):
    success: bool
    mode: str
    response: AIResponse | None
    error: ErrorResponse | None