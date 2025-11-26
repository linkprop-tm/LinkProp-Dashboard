import { useState, useEffect } from 'react';
import { obtenerPropiedades, contarInteresadosPorPropiedad } from '../api/properties';
import { obtenerMatchesParaPropiedad } from '../api/matches';
import { propiedadToProperty } from '../adapters';
import type { Property } from '../../types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const propiedades = await obtenerPropiedades();

      const propertiesWithCounts = await Promise.all(
        propiedades.map(async (propiedad) => {
          try {
            const [interesadosCount, matchesData] = await Promise.all([
              contarInteresadosPorPropiedad(propiedad.id),
              obtenerMatchesParaPropiedad(propiedad.id, 50).catch(() => ({ total_matches: 0 }))
            ]);

            return propiedadToProperty(propiedad, matchesData.total_matches, interesadosCount);
          } catch (err) {
            return propiedadToProperty(propiedad, 0, 0);
          }
        })
      );

      setProperties(propertiesWithCounts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar propiedades');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    refetch: loadProperties
  };
}
