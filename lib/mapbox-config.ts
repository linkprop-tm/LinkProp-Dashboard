export const MAPBOX_CONFIG = {
  center: [-58.4173, -34.6118] as [number, number],
  zoom: 11,
  style: 'mapbox://styles/mapbox/streets-v12',

  cabaBounds: {
    north: -34.5265,
    south: -34.7052,
    east: -58.3354,
    west: -58.5314
  }
};

export function isPointInCABA(lng: number, lat: number): boolean {
  const { north, south, east, west } = MAPBOX_CONFIG.cabaBounds;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

export function getMapboxToken(): string {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    console.error('VITE_MAPBOX_TOKEN is not defined in environment variables');
    return '';
  }
  return token;
}
