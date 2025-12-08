import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MAPBOX_CONFIG, getMapboxToken } from '../lib/mapbox-config';
import { calculatePolygonArea, formatArea } from '../lib/geo-utils';
import { Trash2, MapPin } from 'lucide-react';

interface MapZoneDrawerProps {
  initialZone?: any;
  onZoneChange?: (zone: any) => void;
  height?: string;
}

export const MapZoneDrawer: React.FC<MapZoneDrawerProps> = ({
  initialZone,
  onZoneChange,
  height = '400px'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [area, setArea] = useState<number>(0);
  const [hasPolygon, setHasPolygon] = useState(false);
  const isMapReady = useRef(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = getMapboxToken();
    if (!token) {
      console.error('Mapbox token not found. Please add VITE_MAPBOX_TOKEN to your .env file');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.style,
      center: MAPBOX_CONFIG.center,
      zoom: MAPBOX_CONFIG.zoom,
      attributionControl: false
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon',
      styles: [
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.2
          }
        },
        {
          id: 'gl-draw-polygon-stroke',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#3b82f6'
          }
        }
      ]
    });

    map.current.addControl(draw.current);

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const updatePolygon = () => {
      if (!draw.current) return;

      const data = draw.current.getAll();

      if (data.features.length > 1) {
        const lastFeature = data.features[data.features.length - 1];
        data.features.forEach((feature, index) => {
          if (index < data.features.length - 1 && feature.id) {
            draw.current?.delete(feature.id.toString());
          }
        });

        if (lastFeature.geometry.type === 'Polygon') {
          const coords = lastFeature.geometry.coordinates;
          const calculatedArea = calculatePolygonArea(coords);
          setArea(calculatedArea);
          setHasPolygon(true);
          onZoneChange?.(lastFeature);
        }
      } else if (data.features.length === 1) {
        const feature = data.features[0];
        if (feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates;
          const calculatedArea = calculatePolygonArea(coords);
          setArea(calculatedArea);
          setHasPolygon(true);
          onZoneChange?.(feature);
        }
      } else {
        setArea(0);
        setHasPolygon(false);
        onZoneChange?.(null);
      }
    };

    map.current.on('draw.create', updatePolygon);
    map.current.on('draw.update', updatePolygon);
    map.current.on('draw.delete', updatePolygon);

    map.current.on('load', () => {
      isMapReady.current = true;
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Load initial zone when it becomes available or changes
  useEffect(() => {
    if (!initialZone || !initialZone.geometry || !draw.current || !map.current) {
      return;
    }

    // Wait for the map to be fully loaded
    const loadZone = () => {
      if (!draw.current || !map.current) return;

      // Clear existing polygons
      draw.current.deleteAll();

      // Add the initial zone
      draw.current.add(initialZone);

      if (initialZone.geometry.type === 'Polygon') {
        const coords = initialZone.geometry.coordinates;
        const calculatedArea = calculatePolygonArea(coords);
        setArea(calculatedArea);
        setHasPolygon(true);

        // Calculate bounds to fit the polygon in view
        const bounds = new mapboxgl.LngLatBounds();
        coords[0].forEach((coord: [number, number]) => {
          bounds.extend(coord);
        });

        // Fit map to polygon bounds with padding
        map.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
      }
    };

    if (isMapReady.current) {
      loadZone();
    } else {
      // If map is not ready yet, wait for it
      const checkInterval = setInterval(() => {
        if (isMapReady.current) {
          loadZone();
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [initialZone]);

  const handleClearZone = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setArea(0);
      setHasPolygon(false);
      onZoneChange?.(null);
    }
  };

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-xl border border-gray-200 overflow-hidden"
      />

      {hasPolygon && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-3 z-10">
          <MapPin size={16} className="text-primary-600" />
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Área Seleccionada</p>
            <p className="text-sm font-bold text-gray-900">{formatArea(area)}</p>
          </div>
        </div>
      )}

      {hasPolygon && (
        <button
          onClick={handleClearZone}
          className="absolute bottom-4 left-4 bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg border border-red-200 flex items-center gap-2 text-sm font-bold transition-all z-10"
        >
          <Trash2 size={16} />
          Limpiar zona
        </button>
      )}

      <div className="mt-3 text-xs text-gray-500 text-center">
        Dibuja un polígono en el mapa para definir tu zona de preferencia
      </div>
    </div>
  );
};
