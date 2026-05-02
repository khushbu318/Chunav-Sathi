import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel, ChatSession, Content, Part
import os
from dotenv import load_dotenv
load_dotenv()

# This line tells Google's library where to look for the key
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Load environment variables
load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")

# Initialize Vertex AI
# --- Update this section in your main.py ---

# Define the System Instruction
ELECTION_ASSISTANT_PROMPT = """
You are "Chunav Sathi," a dedicated Indian Election Helping Assistant. 
Your goal is to provide accurate, neutral, and helpful information about the Indian electoral process.

Guidelines:
1. Information Scope: Cover topics like voter registration (Voter ID), finding polling booths, understanding EVMs/VVPAT, election dates, and the roles of various elected representatives (MP, MLA, Corporator).
2. Tone: Be polite, professional, and encouraging. Use simple language to explain complex legal or constitutional terms.
3. Neutrality: Remain strictly non-partisan. Never support or oppose any political party or candidate.
4. Language: If the user asks in Hindi or English, respond in the same language.
5. Safety: If asked for your opinion on who to vote for, explain that as an AI, you cannot provide political opinions and encourage the user to research candidates' backgrounds.
"""

# Initialize the model with the system instruction

vertexai.init(project=PROJECT_ID, location=LOCATION)
model = GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=[ELECTION_ASSISTANT_PROMPT]
)
# model = GenerativeModel("gemini-2.5-flash")

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Convert history for Vertex AI
        formatted_history = [
            Content(role=m.role, parts=[Part.from_text(m.content)]) 
            for m in request.history
        ]
        
        chat_session = model.start_chat(history=formatted_history)
        response = chat_session.send_message(request.message)
        
        return {
            "response": response.text,
            "history": request.history + [
                {"role": "user", "content": request.message},
                {"role": "model", "content": response.text}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

from google.cloud import aiplatform

@app.get("/debug-models")
async def list_available_models():
    try:
        # Initialize the AI Platform
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        
        # List all models in the project
        models = aiplatform.Model.list()
        
        # Format the output for readability
        model_list = [
            {
                "display_name": m.display_name,
                "model_id": m.resource_name,
                "version_id": m.version_id
            } for m in models
        ]
        
        return {"available_models": model_list}
    except Exception as e:
        return {"error": str(e)}
    
