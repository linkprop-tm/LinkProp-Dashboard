export const NEIGHBORHOODS = [
  'Agronomía',
  'Almagro',
  'Balvanera',
  'Barracas',
  'Belgrano',
  'Belgrano C',
  'Belgrano R',
  'Boedo',
  'Caballito',
  'Chacarita',
  'Coghlan',
  'Colegiales',
  'Constitución',
  'Flores',
  'Floresta',
  'La Boca',
  'La Paternal',
  'Las Cañitas',
  'Liniers',
  'Mataderos',
  'Monte Castro',
  'Monserrat',
  'Nueva Pompeya',
  'Núñez',
  'Palermo',
  'Palermo Botánico',
  'Palermo Chico',
  'Palermo Hollywood',
  'Palermo Soho',
  'Parque Avellaneda',
  'Parque Centenario',
  'Parque Chacabuco',
  'Parque Chas',
  'Parque Patricios',
  'Puerto Madero',
  'Recoleta',
  'Retiro',
  'Saavedra',
  'San Cristóbal',
  'San Nicolás',
  'San Telmo',
  'Vélez Sarsfield',
  'Versalles',
  'Villa Crespo',
  'Villa del Parque',
  'Villa Devoto',
  'Villa General Mitre',
  'Villa Lugano',
  'Villa Luro',
  'Villa Ortúzar',
  'Villa Pueyrredón',
  'Villa Real',
  'Villa Riachuelo',
  'Villa Santa Rita',
  'Villa Soldati',
  'Villa Urquiza'
] as const;

export const NEIGHBORHOOD_HIERARCHY: Record<string, string[]> = {
  'Palermo': [
    'Palermo',
    'Palermo Chico',
    'Palermo Botánico',
    'Las Cañitas',
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
