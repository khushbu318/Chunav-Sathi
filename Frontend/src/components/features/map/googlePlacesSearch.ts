declare global {
  interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY?: string;
    readonly VITE_API_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface SearchResult {
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance_km: number;
  open_now?: boolean;
  rating?: number;
  phone?: string;
  hours?: string[];
  type: 'polling_booth' | 'election_office' | 'other';
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  searchLocation?: { lat: number; lng: number };
}

import type { Location } from './locationDatabase';
import { LOCATIONS_DATABASE } from './locationDatabase';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const searchStaticLocations = (query: string): Location[] => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase().trim();

  return LOCATIONS_DATABASE.filter((location) => {
    return (
      location.name.toLowerCase().includes(searchTerm) ||
      location.address.toLowerCase().includes(searchTerm) ||
      location.area.toLowerCase().includes(searchTerm) ||
      location.city.toLowerCase().includes(searchTerm) ||
      location.pincode.includes(searchTerm) ||
      location.state.toLowerCase().includes(searchTerm)
    );
  });
};

export const isGoogleMapsEnabled = Boolean(GOOGLE_MAPS_API_KEY);

export const searchLocations = async (query: string, lat?: number, lng?: number): Promise<SearchResult[]> => {
  if (!query.trim() && lat === undefined && lng === undefined) return [];

  if (!GOOGLE_MAPS_API_KEY) {
    // Fallback to static data
    const staticResults = searchStaticLocations(query);
    return staticResults.map(loc => ({
      place_id: loc.id,
      name: loc.name,
      address: loc.address,
      lat: loc.lat,
      lng: loc.lng,
      distance_km: 0, // Can't calculate without search location
      type: loc.type as 'polling_booth' | 'election_office' | 'other'
    }));
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/election-offices/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, lat, lng }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Search proxy error:', response.status, data);
      throw new Error(data.error || `Search failed with status ${response.status}`);
    }

    if (!Array.isArray(data.results)) {
      throw new Error('Search proxy returned invalid data');
    }

    return data.results;
  } catch (error) {
    console.error('Search proxy fetch failed:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<SearchResult> => {
  const response = await fetch(`${API_BASE_URL}/api/election-offices/details/${placeId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch place details');
  }

  return data;
};

export const getGoogleMapsUrl = (location: SearchResult): string => {
  const base = 'https://www.google.com/maps/search/?api=1';
  const query = encodeURIComponent(`${location.name} ${location.address}`.trim());
  return `${base}&query=${query}&query_place_id=${location.place_id}`;
};

export const getGoogleMapsDirectionsUrl = (location: SearchResult): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
};

export const getStaticMapUrl = (location: SearchResult): string => {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=400x200&markers=${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}`;
};

