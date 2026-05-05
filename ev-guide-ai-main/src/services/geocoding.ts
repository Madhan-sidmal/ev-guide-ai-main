import type { Location } from '@/types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export interface GeocodeSuggestion {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

export const geocodeSearch = async (query: string): Promise<GeocodeSuggestion[]> => {
  if (query.length < 3) return [];
  const res = await fetch(
    `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
    { headers: { 'User-Agent': 'EVRangePredictor/1.0' } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: any) => ({
    placeId: item.place_id?.toString(),
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const res = await fetch(
    `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'User-Agent': 'EVRangePredictor/1.0' } }
  );
  if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const data = await res.json();
  return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};
