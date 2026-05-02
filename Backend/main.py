import os
from math import radians, sin, cos, sqrt, atan2
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import vertexai
from vertexai.generative_models import GenerativeModel, ChatSession, Content, Part
import googlemaps
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

# Only set application credentials if the variable is configured.
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if GOOGLE_APPLICATION_CREDENTIALS:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS



PROJECT_ID = os.getenv("GCP_PROJECT_ID")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")

MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
gmaps = googlemaps.Client(key=MAPS_API_KEY)

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGIN.split(",") if origin.strip()] or ["*"]
STATIC_DIR = os.getenv("STATIC_DIR", os.path.join(os.path.dirname(__file__), "../frontend/dist"))

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlon = lng2 - lng1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return 6371 * c


def build_maps_url(place_id: str, name: str) -> str:
    query = quote_plus(name or '')
    return f"https://www.google.com/maps/search/?api=1&query={query}&query_place_id={place_id}"


def geocode_query(query: str):
    if not query:
        return None

    results = gmaps.geocode(query)
    if not results:
        return None

    location = results[0].get('geometry', {}).get('location')
    if not location:
        return None

    return location.get('lat'), location.get('lng')


def search_nearby_places(lat: float, lng: float, keyword: str, result_type: str):
    response = gmaps.places_nearby(
        location=f"{lat},{lng}",
        radius=20000,
        keyword=keyword,
        language='en'
    )

    places = []
    for place in response.get('results', []):
        geometry = place.get('geometry', {}).get('location', {})
        if not geometry:
            continue

        places.append({
            'place_id': place.get('place_id'),
            'name': place.get('name'),
            'address': place.get('vicinity') or place.get('formatted_address'),
            'lat': geometry.get('lat'),
            'lng': geometry.get('lng'),
            'open_now': place.get('opening_hours', {}).get('open_now'),
            'rating': place.get('rating'),
            'maps_url': build_maps_url(place.get('place_id'), place.get('name')),
            'type': result_type,
        })

    return places

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

LANGUAGE RULES:
1. Always respond in the language used by the user (e.g., if asked in Marathi, respond in Marathi).
2. If the user asks in a language you don't support, politely explain this in English and ask them to choose one of the major Indian languages.
3. You are fluent in English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, and Bhojpuri.
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
    allow_origins=ALLOWED_ORIGINS,
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
    language: Optional[str] = "English"  # New field

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Convert history for Vertex AI
        formatted_history = [
            Content(role=m.role, parts=[Part.from_text(m.content)]) 
            for m in request.history
        ]
        
        # Add the language preference to the start of the message
        # to guide the model's response language
        full_message = f"Please respond in {request.language}: {request.message}"
        
        chat_session = model.start_chat(history=formatted_history)
        response = chat_session.send_message(full_message)
        
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
    
@app.get("/find-booths")
async def find_booths(
    location_query: str = Query(..., description="Pincode, Area, or City"),
    lat: Optional[float] = Query(None, description="Optional latitude for location-based search"),
    lng: Optional[float] = Query(None, description="Optional longitude for location-based search")
):
    try:
        if not MAPS_API_KEY:
            raise HTTPException(status_code=500, detail="Google Maps API key is not configured on the backend.")

        # Use provided coordinates when available, otherwise geocode the text query.
        if lat is None or lng is None:
            location = geocode_query(location_query)
            if not location:
                raise HTTPException(status_code=404, detail="Location not found")
            lat, lng = location

        search_keywords = [
            ("election office", "election_office"),
            ("polling booth", "polling_booth"),
            ("election commission office", "election_office"),
        ]

        seen_place_ids = set()
        booths = []

        for keyword, result_type in search_keywords:
            for place in search_nearby_places(lat, lng, keyword, result_type):
                if not place['place_id'] or place['place_id'] in seen_place_ids:
                    continue
                seen_place_ids.add(place['place_id'])
                place['distance_km'] = round(haversine_km(lat, lng, place['lat'], place['lng']), 1)
                place['status'] = 'Open' if place.get('open_now') else 'Closed/Unknown'
                booths.append(place)

        booths.sort(key=lambda item: item.get('distance_km', 9999))

        return {
            "query": location_query,
            "results_count": len(booths),
            "booths": booths,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve frontend static assets from the build output.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
