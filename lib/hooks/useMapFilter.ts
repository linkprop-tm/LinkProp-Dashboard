import { useState, useEffect, useMemo } from 'react';
import { Propiedad } from '../database.types';
import { Polygon, isPointInPolygon, loadDrawnArea, clearDrawnArea as clearStoredArea } from '../geo-utils';

export function useMapFilter(properties: Propiedad[]) {
  const [drawnPolygon, setDrawnPolygon] = useState<Polygon | null>(null);

  useEffect(() => {
    const savedPolygon = loadDrawnArea();
    if (savedPolygon && savedPolygon.length > 0) {
      setDrawnPolygon(savedPolygon);
    }
  }, []);

  const filteredProperties = useMemo(() => {
    if (!drawnPolygon || drawnPolygon.length === 0) {
      return properties;
    }

    return properties.filter(property => {
      if (!property.latitud || !property.longitud) {
        return false;
      }

      return isPointInPolygon(property.latitud, property.longitud, drawnPolygon);
    });
  }, [properties, drawnPolygon]);

  const handlePolygonDrawn = (polygon: Polygon) => {
    setDrawnPolygon(polygon);
  };

  const handlePolygonCleared = () => {
    setDrawnPolygon(null);
    clearStoredArea();
  };

  const clearFilter = () => {
    setDrawnPolygon(null);
    clearStoredArea();
  };

  const hasActiveFilter = drawnPolygon !== null && drawnPolygon.length > 0;

  return {
    drawnPolygon,
    filteredProperties,
    handlePolygonDrawn,
    handlePolygonCleared,
    clearFilter,
    hasActiveFilter,
    filterCount: hasActiveFilter ? filteredProperties.length : properties.length
  };
}
