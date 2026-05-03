import logging
import os
import re
import time
from math import radians, sin, cos, sqrt, atan2
from typing import List, Optional, Tuple, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv

import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
import googlemaps
from urllib.parse import quote_plus
from google.cloud import aiplatform
from google.cloud import bigquery

# ============================================================================
# Configuration & Security Setup
# ============================================================================

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# Environment Variables & Configuration
# ============================================================================

PROJECT_ID = (
    os.getenv("GCP_PROJECT_ID")
    or os.getenv("GOOGLE_CLOUD_PROJECT")
    or os.getenv("GCLOUD_PROJECT")
)
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

if GOOGLE_APPLICATION_CREDENTIALS:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_APPLICATION_CREDENTIALS

# CORS Configuration
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "")
ALLOWED_ORIGINS = (
    [origin.strip() for origin in ALLOWED_ORIGIN.split(",") if origin.strip()]
    or ["http://localhost:3000", "http://localhost:5173"]  # Default to localhost only
)

# Host and transport security configuration
REQUIRE_HTTPS = os.getenv("REQUIRE_HTTPS", "false").lower() in ("1", "true", "yes")

# Determine if running on Cloud Run
IS_CLOUD_RUN = os.getenv("K_SERVICE") is not None or os.getenv("PORT") == "8080"

ALLOWED_HOSTS = []
for origin in ALLOWED_ORIGINS:
    host = re.sub(r"^https?://", "", origin).split("/")[0].split(":")[0]
    if host:
        ALLOWED_HOSTS.append(host)

# Add default hosts for all environments
for required_host in ["localhost", "127.0.0.1", "testserver"]:
    if required_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(required_host)

# For Cloud Run, accept all *.run.app domains if no explicit ALLOWED_ORIGIN is set
if IS_CLOUD_RUN and not ALLOWED_ORIGIN:
    ALLOWED_HOSTS.append("*.run.app")
    logger.info(f"Cloud Run detected. Allowing *.run.app domains. Allowed hosts: {ALLOWED_HOSTS}")

SECURE_HEADERS = {
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
    "Permissions-Policy": "geolocation=()",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "img-src 'self' data: https:; "
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "connect-src 'self' https://*.googleapis.com https://*.gstatic.com; "
        "frame-ancestors 'none'; base-uri 'self';"
    ),
}

STATIC_DIR = os.getenv(
    "STATIC_DIR",
    os.path.join(os.path.dirname(__file__), "../Frontend/dist")
)

# Security Configuration
MAX_MESSAGE_LENGTH = 5000  # Limit chat message size
MAX_LOCATION_LENGTH = 500  # Limit location query size
MAX_HISTORY_SIZE = 100  # Limit history messages
MAX_REQUESTS_PER_MINUTE = 60  # Rate limiting

# ============================================================================
# Rate Limiting Implementation
# ============================================================================

class RateLimiter:
    """Simple in-memory rate limiter"""
    def __init__(self, max_requests: int, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed for the identifier"""
        now = time.time()
        cutoff = now - self.window_seconds

        # Remove old requests outside the window
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > cutoff
        ]

        # Check if limit exceeded
        if len(self.requests[identifier]) >= self.max_requests:
            return False

        # Add current request
        self.requests[identifier].append(now)
        return True


rate_limiter = RateLimiter(MAX_REQUESTS_PER_MINUTE, window_seconds=60)

# ============================================================================
# Input Validation & Sanitization
# ============================================================================

class InputSanitizer:
    """Sanitize and validate user inputs"""

    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Remove potentially harmful characters"""
        if not isinstance(value, str):
            raise ValueError("Input must be a string")

        # Truncate to max length
        value = value[:max_length]

        # Remove null bytes
        value = value.replace('\0', '')

        # Remove control characters except newlines and tabs
        value = ''.join(
            char for char in value
            if ord(char) >= 32 or char in '\n\t'
        )

        return value.strip()

    @staticmethod
    def validate_coordinates(lat: float, lng: float) -> Tuple[float, float]:
        """Validate latitude and longitude"""
        if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
            raise ValueError("Coordinates must be numbers")

        if lat < -90 or lat > 90:
            raise ValueError("Latitude must be between -90 and 90")

        if lng < -180 or lng > 180:
            raise ValueError("Longitude must be between -180 and 180")

        return float(lat), float(lng)

    @staticmethod
    def validate_language(language: str) -> str:
        """Validate supported language"""
        supported_languages = [
            "English", "Hindi", "Bengali", "Telugu", "Marathi",
            "Tamil", "Gujarati", "Kannada", "Malayalam", "Punjabi",
            "Odia", "Urdu", "Bhojpuri"
        ]

        if language not in supported_languages:
            logger.warning(f"Unsupported language requested: {language}")
            return "English"  # Default to English

        return language


# ============================================================================
# Pydantic Models with Validation
# ============================================================================

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|model)$")
    content: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ['user', 'model']:
            raise ValueError('Role must be "user" or "model"')
        return v


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    language: Optional[str] = "English"

    @field_validator('message')
    @classmethod
    def sanitize_message(cls, v):
        return InputSanitizer.sanitize_string(v, MAX_MESSAGE_LENGTH)

    @field_validator('language')
    @classmethod
    def validate_lang(cls, v):
        return InputSanitizer.validate_language(v)

    @field_validator('history')
    @classmethod
    def validate_history(cls, v):
        if len(v) > MAX_HISTORY_SIZE:
            raise ValueError(f'History cannot exceed {MAX_HISTORY_SIZE} messages')
        return v


class FindBoothsRequest(BaseModel):
    location_query: str = Field(..., min_length=1, max_length=MAX_LOCATION_LENGTH)
    lat: Optional[float] = None
    lng: Optional[float] = None


class Constituency(BaseModel):
    id: str
    name: str
    state: str
    stateName: str
    mpName: str
    mpParty: str
    mpPhotoUrl: Optional[str] = ""
    votes: int
    voteShare: float
    margin: int
    turnout: float
    phase: int
    nextElectionDate: str


# ============================================================================
# Google Maps & Vertex AI Initialization
# ============================================================================

gmaps = None
try:
    if MAPS_API_KEY:
        gmaps = googlemaps.Client(key=MAPS_API_KEY)
        logger.info("Google Maps API initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Google Maps API: {e}")
    gmaps = None

# Define the Election Assistant System Instruction
ELECTION_ASSISTANT_PROMPT = """
You are "Chunav Sathi," a dedicated Indian Election Helping Assistant. 
Your goal is to provide accurate, neutral, and helpful information about the Indian electoral process.

Guidelines:
1. Information Scope: Cover topics like voter registration (Voter ID), finding polling booths, understanding EVMs/VVPAT, election dates, and the roles of various elected representatives (MP, MLA, Corporator).
2. Tone: Be polite, professional, and encouraging. Use simple language to explain complex legal or constitutional terms.
3. Neutrality: Remain strictly non-partisan. Never support or oppose any political party or candidate.
4. Language: Respond in the language used by the user.
5. Safety: If asked for political opinions, explain that as an AI, you cannot provide such opinions and encourage research.

LANGUAGE RULES:
1. Always respond in the language used by the user (e.g., if asked in Marathi, respond in Marathi).
2. You are fluent in English, Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, and Bhojpuri.
"""

model = None
try:
    vertexai_init_kwargs = {"location": LOCATION}
    if PROJECT_ID:
        vertexai_init_kwargs["project"] = PROJECT_ID

    vertexai.init(**vertexai_init_kwargs)
    model = GenerativeModel(
        "gemini-2.5-flash",
        system_instruction=[ELECTION_ASSISTANT_PROMPT]
    )
    logger.info("Vertex AI initialized successfully")
except Exception as e:
    logger.error(f"Vertex AI initialization failed: {e}")
    model = None

# Initialize BigQuery client
bq_client = None
try:
    bq_client = bigquery.Client(project=PROJECT_ID)
    logger.info("BigQuery client initialized successfully")
except Exception as e:
    logger.error(f"BigQuery client initialization failed: {e}")
    bq_client = None

# ============================================================================
# Utility Functions
# ============================================================================

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula"""
    try:
        lat1, lng1 = InputSanitizer.validate_coordinates(lat1, lng1)
        lat2, lng2 = InputSanitizer.validate_coordinates(lat2, lng2)

        lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlon = lng2 - lng1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return 6371 * c
    except Exception as e:
        logger.error(f"Haversine calculation failed: {e}")
        return float('inf')


def build_maps_url(place_id: str, name: str) -> str:
    """Build Google Maps URL safely"""
    if not place_id or not isinstance(place_id, str):
        return ""

    name = name or ""
    name = InputSanitizer.sanitize_string(name, 100)
    query = quote_plus(name)

    return f"https://www.google.com/maps/search/?api=1&query={query}&query_place_id={place_id}"


def geocode_query(query: str) -> Optional[Tuple[float, float]]:
    """Geocode location query with error handling"""
    if not gmaps or not query:
        return None

    try:
        query = InputSanitizer.sanitize_string(query, MAX_LOCATION_LENGTH)
        results = gmaps.geocode(query)

        if not results:
            return None

        location = results[0].get('geometry', {}).get('location')
        if not location:
            return None

        lat = location.get('lat')
        lng = location.get('lng')

        return InputSanitizer.validate_coordinates(lat, lng)

    except Exception as e:
        logger.error(f"Geocoding failed for query '{query}': {e}")
        return None


def search_nearby_places(
    lat: float,
    lng: float,
    keyword: str,
    result_type: str
) -> List[Dict[str, Any]]:
    """Search for nearby places with error handling"""
    if not gmaps:
        return []

    try:
        lat, lng = InputSanitizer.validate_coordinates(lat, lng)

        response = gmaps.places_nearby(
            location=f"{lat},{lng}",
            radius=20000,
            keyword=keyword,
            language='en'
        )

        places = []
        for place in response.get('results', []):
            try:
                geometry = place.get('geometry', {}).get('location', {})
                if not geometry:
                    continue

                place_id = place.get('place_id', '')
                if not place_id:
                    continue

                place_lat = geometry.get('lat')
                place_lng = geometry.get('lng')

                if not place_lat or not place_lng:
                    continue

                place_lat, place_lng = InputSanitizer.validate_coordinates(
                    place_lat, place_lng
                )

                places.append({
                    'place_id': place_id,
                    'name': InputSanitizer.sanitize_string(place.get('name', ''), 200),
                    'address': InputSanitizer.sanitize_string(
                        place.get('vicinity') or place.get('formatted_address', ''), 200
                    ),
                    'lat': place_lat,
                    'lng': place_lng,
                    'open_now': place.get('opening_hours', {}).get('open_now'),
                    'rating': place.get('rating'),
                    'maps_url': build_maps_url(place_id, place.get('name', '')),
                    'type': result_type,
                })
            except Exception as e:
                logger.warning(f"Error processing place: {e}")
                continue

        return places

    except Exception as e:
        logger.error(f"Places search failed: {e}")
        return []


# ============================================================================
# FastAPI Application Setup
# ============================================================================

app = FastAPI(
    title="Chunav Sathi API",
    description="Indian Election Helping Assistant API",
    version="1.0.0"
)

# Enforce trusted hosts and HTTPS if configured
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS,
)

@app.middleware("http")
async def secure_headers_middleware(request: Request, call_next):
    if REQUIRE_HTTPS:
        forwarded_proto = request.headers.get("x-forwarded-proto", request.url.scheme)
        if forwarded_proto != "https":
            return JSONResponse(
                status_code=403,
                content={"detail": "HTTPS is required. Please use a secure endpoint."}
            )

    response = await call_next(request)
    for header_name, header_value in SECURE_HEADERS.items():
        response.headers.setdefault(header_name, header_value)
    return response

# Add CORS middleware with secure configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Restrict to necessary methods
    allow_headers=["Content-Type"],
    max_age=3600,
)


# Custom exception handler for validation errors
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid input: " + str(exc)}
    )


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health")
async def health_check(request: Request):
    """Health check endpoint"""
    client_ip = request.client.host if request.client else "unknown"
    logger.info(f"Health check from {client_ip}")

    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }


@app.post("/api/chat")
async def chat(request: ChatRequest, http_request: Request = None):
    """Chat endpoint with Vertex AI"""
    if http_request is None:
        from fastapi import Request as _Request
    client_ip = http_request.client.host if http_request and http_request.client else "unknown"

    # Rate limiting check
    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

    if model is None:
        logger.error("Model not initialized")
        raise HTTPException(
            status_code=503,
            detail=(
                "AI model is not initialized. "
                "Please check Cloud Run service account credentials and Vertex AI configuration."
            ),
        )

    try:
        logger.info(f"Chat request from {client_ip} in {request.language}")

        # Validate history
        if len(request.history) > MAX_HISTORY_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"History cannot exceed {MAX_HISTORY_SIZE} messages"
            )

        # Convert history for Vertex AI
        formatted_history = [
            Content(
                role=m.role,
                parts=[Part.from_text(m.content)]
            )
            for m in request.history
        ]

        # Prepare message with language guidance
        full_message = (
            f"Respond in {request.language}: {request.message}"
        )

        # Send message
        chat_session = model.start_chat(history=formatted_history)
        response = chat_session.send_message(full_message)

        logger.info(f"Chat successful for {client_ip}")

        return {
            "response": response.text,
            "history": request.history + [
                {"role": "user", "content": request.message},
                {"role": "model", "content": response.text}
            ]
        }

    except ValueError as e:
        logger.warning(f"Validation error from {client_ip}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/find-booths")
async def find_booths(
    location_query: str = Query(
        ...,
        min_length=1,
        max_length=MAX_LOCATION_LENGTH,
        description="Pincode, Area, or City"
    ),
    lat: Optional[float] = Query(
        None,
        description="Optional latitude for location-based search"
    ),
    lng: Optional[float] = Query(
        None,
        description="Optional longitude for location-based search"
    ),
    http_request: Request = None
):
    """Find polling booths and election offices"""
    client_ip = http_request.client.host if http_request and http_request.client else "unknown"

    # Rate limiting check
    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

    if gmaps is None:
        logger.error("Google Maps API not configured")
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Maps API is not configured. "
                "Please set GOOGLE_MAPS_API_KEY environment variable."
            ),
        )

    try:
        logger.info(f"Booth search from {client_ip} for '{location_query}'")

        # Sanitize location query
        location_query = InputSanitizer.sanitize_string(
            location_query,
            MAX_LOCATION_LENGTH
        )

        # Validate coordinates if provided
        if lat is not None or lng is not None:
            if lat is None or lng is None:
                raise ValueError("Both latitude and longitude must be provided together")

            lat, lng = InputSanitizer.validate_coordinates(lat, lng)
        else:
            # Geocode the location query
            location = geocode_query(location_query)
            if not location:
                logger.warning(f"Location not found: {location_query}")
                raise HTTPException(status_code=404, detail="Location not found")
            lat, lng = location

        # Search for nearby booths
        search_keywords = [
            ("election office", "election_office"),
            ("polling booth", "polling_booth"),
            ("election commission office", "election_office"),
        ]

        seen_place_ids = set()
        booths = []

        for keyword, result_type in search_keywords:
            for place in search_nearby_places(lat, lng, keyword, result_type):
                place_id = place.get('place_id')
                if not place_id or place_id in seen_place_ids:
                    continue

                seen_place_ids.add(place_id)

                try:
                    distance = haversine_km(
                        lat, lng,
                        place.get('lat'), place.get('lng')
                    )
                    place['distance_km'] = round(distance, 1)
                    place['status'] = 'Open' if place.get('open_now') else 'Closed/Unknown'
                    booths.append(place)
                except Exception as e:
                    logger.warning(f"Error processing booth {place_id}: {e}")
                    continue

        # Sort by distance
        booths.sort(key=lambda item: item.get('distance_km', 9999))

        logger.info(f"Found {len(booths)} booths for {client_ip}")

        return {
            "query": location_query,
            "results_count": len(booths),
            "booths": booths,
        }

    except ValueError as e:
        logger.warning(f"Validation error from {client_ip}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Find booths endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/debug-models")
async def list_available_models(http_request: Request):
    """List available Vertex AI models (for debugging)"""
    client_ip = http_request.client.host if http_request.client else "unknown"
    logger.info(f"Debug models request from {client_ip}")

    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

    try:
        aiplatform_args = {"location": LOCATION}
        if PROJECT_ID:
            aiplatform_args["project"] = PROJECT_ID

        aiplatform.init(**aiplatform_args)
        models = aiplatform.Model.list()

        model_list = [
            {
                "display_name": m.display_name,
                "model_id": m.resource_name,
                "version_id": m.version_id
            }
            for m in models
        ]

        return {"available_models": model_list}

    except Exception as e:
        logger.error(f"Debug models endpoint error: {e}", exc_info=True)
        return {"error": "Failed to list models"}


@app.get("/api/constituencies")
async def get_constituencies(http_request: Request):
    """Get all constituencies data from BigQuery"""
    client_ip = http_request.client.host if http_request.client else "unknown"
    logger.info(f"Constituencies request from {client_ip}")

    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

    try:
        if bq_client is None:
            logger.error("BigQuery client not initialized")
            raise HTTPException(
                status_code=503,
                detail="BigQuery service is not configured."
            )

        # Query BigQuery for constituencies data
        query = """
        SELECT
            id,
            name,
            state,
            stateName,
            mpName,
            mpParty,
            mpPhotoUrl,
            votes,
            voteShare,
            margin,
            turnout,
            phase,
            nextElectionDate
        FROM `chunav_sathi.constituencies`
        ORDER BY state, name
        """

        query_job = bq_client.query(query)
        results = query_job.result()

        constituencies = []
        for row in results:
            constituency = Constituency(
                id=row.id,
                name=row.name,
                state=row.state,
                stateName=row.stateName,
                mpName=row.mpName,
                mpParty=row.mpParty,
                mpPhotoUrl=row.mpPhotoUrl or "",
                votes=row.votes,
                voteShare=row.voteShare,
                margin=row.margin,
                turnout=row.turnout,
                phase=row.phase,
                nextElectionDate=row.nextElectionDate
            )
            constituencies.append(constituency.model_dump())

        logger.info(f"Retrieved {len(constituencies)} constituencies for {client_ip}")

        return {"constituencies": constituencies}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Constituencies endpoint error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/constituencies-geojson")
async def get_constituencies_geojson(http_request: Request):
    """Get constituencies GeoJSON data."""
    client_ip = http_request.client.host if http_request.client else "unknown"
    logger.info(f"GeoJSON request from {client_ip}")

    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )

    logger.warning("GeoJSON endpoint is disabled. No Cloud Storage bucket configured.")
    raise HTTPException(
        status_code=503,
        detail="GeoJSON service is currently unavailable."
    )


# Serve frontend static assets
try:
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
    logger.info(f"Frontend mounted from {STATIC_DIR}")
except Exception as e:
    logger.warning(f"Failed to mount frontend: {e}")


# ============================================================================
# Application Startup/Shutdown
# ============================================================================

@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up")
    logger.info(f"Allowed origins: {ALLOWED_ORIGINS}")
    logger.info(f"Project ID: {PROJECT_ID}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
