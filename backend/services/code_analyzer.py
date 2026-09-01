import os
from services import ai_service as ai
from string import Template
import json


reasoning_analysis = R"F:\HACKAHTON - MVP\Problem-Solving-Intelligence\backend\prompts\reasoning_analysis.txt"
# reasoning_analysis = "backend\prompts\reasoning_analysis.txt"


def load_and_format_prompt(file_path: str, language: str, code: str, prompt: str) -> str:
    """Reads a text file and safely injects variables using string Templates."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist.")
        
    with open(file_path, "r", encoding="utf-8") as file:
        template_content = file.read()
    
    # Use Template instead of .format() to safely ignore JSON curly braces
    # template = Template(template_content)
    
    formatted_prompt = (
        template_content
        .replace("%$language$%", language)
        .replace("%$code$%", code)
        .replace("%$prompt$%", prompt)
    )
    return formatted_prompt

def GetAnalyzeResponse(language, code, prompt):
    response = ai.AskGenai(load_and_format_prompt(file_path=reasoning_analysis, language=language, code=code, prompt=prompt))
    # print(f"{'+'*30}\n{load_and_format_prompt(file_path=reasoning_analysis, language=language, code=code, prompt=prompt)}\n{'+'*30}\n")
    # print(f"{'+'*30}\n{response.text}\n{'+'*30}\n")
    # print(f"{'+'*30}\n{json.loads(response.text)}\n{'+'*30}\n")
    return json.loads(response.text)