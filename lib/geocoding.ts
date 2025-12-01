interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const RATE_LIMIT_DELAY = 1000;

let lastRequestTime = 0;
const geocodeCache = new Map<string, GeocodeResult | null>();

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();
}

function buildSearchQuery(direccion: string, barrio: string, provincia: string): string {
  const parts = [direccion, barrio, provincia, 'Argentina'].filter(Boolean);
  return parts.join(', ');
}

function getCacheKey(direccion: string, barrio: string, provincia: string): string {
  return `${direccion}|${barrio}|${provincia}`.toLowerCase();
}

export async function geocodeAddress(
  direccion: string,
  barrio: string,
  provincia: string
): Promise<GeocodeResult | null> {
  const cacheKey = getCacheKey(direccion, barrio, provincia);

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null;
  }

  await enforceRateLimit();

  const query = buildSearchQuery(direccion, barrio, provincia);

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}?` + new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'ar',
        addressdetails: '1'
      }),
      {
        headers: {
          'User-Agent': 'LinkProp Real Estate Dashboard'
        }
      }
    );

    if (!response.ok) {
      console.error(`Geocoding failed for "${query}": HTTP ${response.status}`);
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No results found for "${query}"`);

      const fallback = await geocodeNeighborhood(barrio, provincia);
      if (fallback) {
        geocodeCache.set(cacheKey, fallback);
        return fallback;
      }

      geocodeCache.set(cacheKey, null);
      return null;
    }

    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name
    };

    geocodeCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`Error geocoding "${query}":`, error);
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

async function geocodeNeighborhood(
  barrio: string,
  provincia: string
): Promise<GeocodeResult | null> {
  if (!barrio) return null;

  await enforceRateLimit();

  const query = `${barrio}, ${provincia}, Argentina`;

  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}?` + new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'ar'
      }),
      {
        headers: {
          'User-Agent': 'LinkProp Real Estate Dashboard'
        }
      }
    );

    if (!response.ok) return null;

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name
    };

  } catch (error) {
    console.error(`Error geocoding neighborhood "${query}":`, error);
    return null;
  }
}

export async function geocodeBatch(
  addresses: Array<{ id: string; direccion: string; barrio: string; provincia: string }>,
  onProgress?: (current: number, total: number, id: string) => void
): Promise<Map<string, GeocodeResult | null>> {
  const results = new Map<string, GeocodeResult | null>();

  for (let i = 0; i < addresses.length; i++) {
    const { id, direccion, barrio, provincia } = addresses[i];

    if (onProgress) {
      onProgress(i + 1, addresses.length, id);
    }

    const result = await geocodeAddress(direccion, barrio, provincia);
    results.set(id, result);
  }

  return results;
}

export function clearGeocodeCache(): void {
  geocodeCache.clear();
}
