export const NEIGHBORHOOD_HIERARCHY: Record<string, string[]> = {
  'Palermo': [
    'Palermo',
    'Palermo Chico',
    'Palermo Botánico',
    'Las Cañitas',
    'Palermo Alto',
    'Palermo Nuevo',
    'Palermo Soho',
    'Palermo Hollywood'
  ]
};

export function expandNeighborhoods(neighborhoods: string[]): string[] {
  const expanded = new Set<string>();

  for (const neighborhood of neighborhoods) {
    const trimmedNeighborhood = neighborhood.trim();

    if (NEIGHBORHOOD_HIERARCHY[trimmedNeighborhood]) {
      NEIGHBORHOOD_HIERARCHY[trimmedNeighborhood].forEach(sub => expanded.add(sub));
    } else {
      expanded.add(trimmedNeighborhood);
    }
  }

  return Array.from(expanded);
}

export function matchesNeighborhood(searchText: string, userNeighborhoods: string[]): boolean {
  if (!userNeighborhoods || userNeighborhoods.length === 0) {
    return true;
  }

  const expandedNeighborhoods = expandNeighborhoods(userNeighborhoods);
  const searchLower = searchText.toLowerCase();

  return expandedNeighborhoods.some(neighborhood =>
    searchLower.includes(neighborhood.toLowerCase())
  );
}
