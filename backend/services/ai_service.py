import os
from dotenv import load_dotenv
from google import genai




# Load .env
load_dotenv()

# Create Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def AskGenai(prompt : str):
    responce = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )
    return responce

# # Send prompt to Gemini
# response = client.models.generate_content(
#     model="gemini-3.6-flash",
#     contents="Explain recursion in programming in simple words."
# )

# # Print Gemini's response
# print(response.text)

