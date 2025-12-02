export function calculatePolygonArea(coordinates: number[][][]): number {
  if (!coordinates || coordinates.length === 0 || !coordinates[0]) {
    return 0;
  }

  const ring = coordinates[0];
  let area = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += x1 * y2 - x2 * y1;
  }

  area = Math.abs(area / 2);

  const earthRadius = 6371;
  const latRadians = (ring[0][1] * Math.PI) / 180;
  const areaKm2 = area * Math.pow(earthRadius * Math.cos(latRadians), 2) * Math.pow(Math.PI / 180, 2);

  return Math.round(areaKm2 * 100) / 100;
}

export function validateGeoJSON(geojson: any): boolean {
  if (!geojson || typeof geojson !== 'object') {
    return false;
  }

  if (geojson.type !== 'Feature' && geojson.type !== 'FeatureCollection') {
    return false;
  }

  return true;
}

export function formatArea(areaKm2: number): string {
  if (areaKm2 >= 1) {
    return `${areaKm2.toFixed(2)} km²`;
  } else {
    const areaMiles = areaKm2 * 1000000;
    return `${Math.round(areaMiles).toLocaleString()} m²`;
  }
}
