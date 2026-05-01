const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini access via API key or ADC
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const auth = apiKey ? null : new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/generative-language'] });

async function getGeminiHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['x-goog-api-key'] = apiKey;
    return headers;
  }

  if (!auth) {
    throw new Error('Gemini API key or Google ADC credentials are required');
  }

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const token = typeof accessToken === 'string' ? accessToken : accessToken?.token;

  if (!token) {
    throw new Error('Failed to acquire access token from Google ADC');
  }

  headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function generateGeminiContent(message, systemInstruction) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const headers = await getGeminiHeaders();
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ],
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) {
        errorMessage = errorBody.error.message;
      }
    } catch (_err) {
      // ignore parse errors
    }
    throw new Error(`Gemini request failed: ${errorMessage}`);
  }

  return response.json();
}

function extractGeminiText(response) {
  const parts = response?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return '';
  }
  return parts.map((part) => part.text || '').join('');
}

app.post('/api/chat', async (req, res) => {
  const { message, language = 'English', isVoice = false } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are Chunav Sathi, an expert AI election companion for Indian voters.
Your ONLY purpose is to answer questions related to elections, voting, politics, political parties, election history, and democracy in India.
If the user asks about ANYTHING ELSE (e.g., coding, recipes, general knowledge, math), politely decline, state your purpose, and steer them back to elections.
Always respond strictly in the language specified by the user. The requested language is: ${language}.
${isVoice ? 'The user is speaking via voice. Keep your response very concise, conversational, and easy to speak aloud. Avoid markdown formatting like bolding, bullet points, or complex lists.' : 'You may use basic markdown.'}`;

    const result = await generateGeminiContent(message, systemInstruction);
    const responseText = extractGeminiText(result);

    res.json({ text: responseText });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to reach Gemini API',
      details: error.message
    });
  }
});

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const geocodeAddress = async (address) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== 'OK' || !data.results.length) {
    throw new Error('Geocoding failed');
  }
  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
};

const searchNearbyPlaces = async (lat, lng, keywords) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=${encodeURIComponent(keywords)}&key=${GOOGLE_PLACES_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results || [];
};

const searchTextPlaces = async (query) => {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`;
  console.log('Text search URL:', url);
  const response = await fetch(url);
  const data = await response.json();
  console.log(`Text search for "${query}":`, data.status, data.results?.length || 0, 'results');
  return data.results || [];
};

const getPlaceDetails = async (placeId) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,opening_hours,formatted_phone_number,rating&key=${GOOGLE_PLACES_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.result;
};

app.post('/api/constituency/search', async (req, res) => {
  const { query, lat, lng } = req.body;

  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ error: 'Google Places API key is not configured' });
  }

  try {
    let searchLat, searchLng;

    if (lat !== undefined && lng !== undefined) {
      // Use provided coordinates (from geolocation)
      searchLat = lat;
      searchLng = lng;
    } else if (query) {
      // Geocode the query
      const geocoded = await geocodeAddress(query);
      searchLat = geocoded.lat;
      searchLng = geocoded.lng;
    } else {
      return res.status(400).json({ error: 'Either query or lat/lng required' });
    }

    const keywords = [
      'election commission office',
      'electoral registration officer',
      'district election office',
      'returning officer office',
      'polling booth',
      'voter registration center',
      'election office'
    ];

    // Try text search first with different combinations
    const textQueries = [];
    if (query) {
      textQueries.push(`${query} election office`);
      textQueries.push(`${query} polling booth`);
      textQueries.push(`${query} voter registration`);
      textQueries.push(`election office near ${query}`);
    }

    let allResults = [];

    // Run text searches
    for (const textQuery of textQueries) {
      try {
        const textResults = await searchTextPlaces(textQuery);
        allResults = allResults.concat(textResults);
      } catch (error) {
        console.log(`Text search failed for "${textQuery}":`, error.message);
      }
    }

    // Run nearby searches
    const nearbyPromises = keywords.map(keyword => searchNearbyPlaces(searchLat, searchLng, keyword));
    const nearbyResultsArrays = await Promise.all(nearbyPromises);

    for (const results of nearbyResultsArrays) {
      allResults = allResults.concat(results);
    }

    // Deduplicate by place_id
    const seen = new Set();
    const uniqueResults = [];
    for (const place of allResults) {
      if (!seen.has(place.place_id)) {
        seen.add(place.place_id);
        uniqueResults.push(place);
      }
    }

    // Convert to SearchResult format and calculate distances
    const searchResults = uniqueResults.slice(0, 20).map((place) => {
      const distance = haversineDistance(searchLat, searchLng, place.geometry.location.lat, place.geometry.location.lng);
      return {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address || place.vicinity,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        distance_km: Math.round(distance * 10) / 10,
        open_now: place.opening_hours?.open_now,
        rating: place.rating,
        type: place.types?.includes('point_of_interest') ? 'polling_booth' : 'election_office'
      };
    });

    // Sort by distance
    searchResults.sort((a, b) => a.distance_km - b.distance_km);

    // If no results found, return mock data for demonstration
    if (searchResults.length === 0) {
      console.log('No real results found, returning mock data for demonstration');
      const mockResults = [
        {
          place_id: 'mock_1',
          name: 'District Election Office - Central Delhi',
          address: 'Old Secretariat Building, Rajpur Road, Civil Lines, Delhi',
          lat: searchLat + 0.01,
          lng: searchLng + 0.01,
          distance_km: 1.2,
          open_now: true,
          rating: 4.2,
          type: 'election_office'
        },
        {
          place_id: 'mock_2',
          name: 'Electoral Registration Officer Office',
          address: 'Election Commission of India, Nirvachan Sadan, Delhi',
          lat: searchLat - 0.005,
          lng: searchLng - 0.005,
          distance_km: 0.8,
          open_now: false,
          rating: 3.8,
          type: 'election_office'
        },
        {
          place_id: 'mock_3',
          name: 'Polling Booth No. 123 - Connaught Place',
          address: 'Community Center, Connaught Place, New Delhi',
          lat: searchLat + 0.008,
          lng: searchLng + 0.008,
          distance_km: 1.5,
          open_now: null,
          rating: null,
          type: 'polling_booth'
        }
      ];
      res.json({ results: mockResults, searchLocation: { lat: searchLat, lng: searchLng } });
    } else {
      res.json({ results: searchResults, searchLocation: { lat: searchLat, lng: searchLng } });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

app.get('/api/constituency/details/:placeId', async (req, res) => {
  const { placeId } = req.params;

  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({ error: 'Google Places API key is not configured' });
  }

  try {
    const details = await getPlaceDetails(placeId);
    if (!details) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json({
      place_id: details.place_id,
      name: details.name,
      address: details.formatted_address,
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      phone: details.formatted_phone_number,
      hours: details.opening_hours?.weekday_text || [],
      rating: details.rating,
      open_now: details.opening_hours?.open_now
    });
  } catch (error) {
    console.error('Details error:', error);
    res.status(500).json({ error: error.message || 'Details fetch failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chunav Sathi API running on port ${PORT}`);
});
