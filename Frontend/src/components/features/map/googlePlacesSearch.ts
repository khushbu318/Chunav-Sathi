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
  maps_url: string;
  phone?: string;
  hours?: string[];
  type: 'polling_booth' | 'election_office' | 'other';
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export const searchLocations = async (query: string, lat?: number, lng?: number): Promise<SearchResult[]> => {
  if (!query.trim() && lat === undefined && lng === undefined) return [];

  const endpoint = API_BASE_URL ? `${API_BASE_URL}/find-booths` : '/find-booths';
  const url = API_BASE_URL ? new URL(endpoint) : new URL(endpoint, window.location.origin);
  url.searchParams.set('location_query', query);
  if (lat !== undefined && lng !== undefined) {
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lng', String(lng));
  }

  const response = await fetch(url.toString());
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Search API error:', response.status, data);
    throw new Error(data.detail || data.error || `Search failed with status ${response.status}`);
  }

  if (!Array.isArray(data.booths)) {
    throw new Error('Search API returned invalid data');
  }

  return data.booths.map((booth: any) => ({
    place_id: booth.place_id,
    name: booth.name,
    address: booth.address,
    lat: booth.lat,
    lng: booth.lng,
    distance_km: booth.distance_km ?? 0,
    open_now: booth.open_now,
    rating: booth.rating,
    maps_url: booth.maps_url,
    phone: booth.phone,
    hours: booth.hours,
    type: booth.type,
  }));
};

export const getGoogleMapsUrl = (location: SearchResult): string => {
  return location.maps_url;
};

export const getGoogleMapsDirectionsUrl = (location: SearchResult): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
};

export const getStaticMapUrl = (location: SearchResult): string | undefined => {
  if (!GOOGLE_MAPS_API_KEY) {
    return undefined;
  }
  return `https://maps.googleapis.com/maps/api/staticmap?center=${location.lat},${location.lng}&zoom=15&size=400x200&markers=${location.lat},${location.lng}&key=${GOOGLE_MAPS_API_KEY}`;
};

