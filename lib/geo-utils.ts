export interface Coordinate {
  lat: number;
  lng: number;
}

export type Polygon = Coordinate[];

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const STORAGE_KEY_DRAWN_AREA = 'map_drawn_area';
const STORAGE_KEY_MAP_CENTER = 'map_center';
const STORAGE_KEY_MAP_ZOOM = 'map_zoom';

export function isPointInPolygon(lat: number, lng: number, polygon: Polygon): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

export function getDistanceBetweenPoints(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

export function getBoundsFromPolygon(polygon: Polygon): MapBounds {
  if (polygon.length === 0) {
    return { north: -34.6037, south: -34.6037, east: -58.3816, west: -58.3816 };
  }

  let north = polygon[0].lat;
  let south = polygon[0].lat;
  let east = polygon[0].lng;
  let west = polygon[0].lng;

  polygon.forEach(coord => {
    if (coord.lat > north) north = coord.lat;
    if (coord.lat < south) south = coord.lat;
    if (coord.lng > east) east = coord.lng;
    if (coord.lng < west) west = coord.lng;
  });

  return { north, south, east, west };
}

export function isValidCoordinate(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) return false;
  return lat >= -55 && lat <= -21 && lng >= -73 && lng <= -53;
}

export function saveDrawnArea(polygon: Polygon): void {
  try {
    localStorage.setItem(STORAGE_KEY_DRAWN_AREA, JSON.stringify(polygon));
  } catch (error) {
    console.error('Error saving drawn area to localStorage:', error);
  }
}

export function loadDrawnArea(): Polygon | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DRAWN_AREA);
    if (!stored) return null;
    const polygon = JSON.parse(stored);
    return Array.isArray(polygon) ? polygon : null;
  } catch (error) {
    console.error('Error loading drawn area from localStorage:', error);
    return null;
  }
}

export function clearDrawnArea(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAWN_AREA);
  } catch (error) {
    console.error('Error clearing drawn area from localStorage:', error);
  }
}

export function saveMapPosition(center: Coordinate, zoom: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_MAP_CENTER, JSON.stringify(center));
    localStorage.setItem(STORAGE_KEY_MAP_ZOOM, zoom.toString());
  } catch (error) {
    console.error('Error saving map position to localStorage:', error);
  }
}

export function loadMapPosition(): { center: Coordinate; zoom: number } | null {
  try {
    const centerStored = localStorage.getItem(STORAGE_KEY_MAP_CENTER);
    const zoomStored = localStorage.getItem(STORAGE_KEY_MAP_ZOOM);

    if (!centerStored || !zoomStored) return null;

    const center = JSON.parse(centerStored);
    const zoom = parseInt(zoomStored, 10);

    if (!center.lat || !center.lng || isNaN(zoom)) return null;

    return { center, zoom };
  } catch (error) {
    console.error('Error loading map position from localStorage:', error);
    return null;
  }
}

export function clearMapPosition(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MAP_CENTER);
    localStorage.removeItem(STORAGE_KEY_MAP_ZOOM);
  } catch (error) {
    console.error('Error clearing map position from localStorage:', error);
  }
}
