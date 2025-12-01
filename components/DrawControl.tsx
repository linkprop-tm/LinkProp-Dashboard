import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { Polygon, saveDrawnArea, clearDrawnArea as clearStoredArea } from '../lib/geo-utils';

interface DrawControlProps {
  onPolygonDrawn?: (polygon: Polygon) => void;
  onPolygonCleared?: () => void;
  initialPolygon?: Polygon | null;
}

export default function DrawControl({
  onPolygonDrawn,
  onPolygonCleared,
  initialPolygon
}: DrawControlProps) {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2
          }
        },
        circle: {
          shapeOptions: {
            color: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2
          }
        },
        polyline: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: true
      }
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);

      const polygon = extractPolygonCoordinates(layer);
      if (polygon && onPolygonDrawn) {
        saveDrawnArea(polygon);
        onPolygonDrawn(polygon);
      }
    });

    map.on(L.Draw.Event.EDITED, (event: any) => {
      const layers = event.layers;
      layers.eachLayer((layer: any) => {
        const polygon = extractPolygonCoordinates(layer);
        if (polygon && onPolygonDrawn) {
          saveDrawnArea(polygon);
          onPolygonDrawn(polygon);
        }
      });
    });

    map.on(L.Draw.Event.DELETED, () => {
      if (drawnItems.getLayers().length === 0) {
        clearStoredArea();
        if (onPolygonCleared) {
          onPolygonCleared();
        }
      }
    });

    if (initialPolygon && initialPolygon.length > 0) {
      const latLngs: L.LatLngExpression[] = initialPolygon.map(coord => [coord.lat, coord.lng]);
      const polygon = L.polygon(latLngs, {
        color: '#3b82f6',
        fillOpacity: 0.2,
        weight: 2
      });
      drawnItems.addLayer(polygon);

      const bounds = polygon.getBounds();
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      map.off(L.Draw.Event.CREATED);
      map.off(L.Draw.Event.EDITED);
      map.off(L.Draw.Event.DELETED);
    };
  }, [map, initialPolygon, onPolygonDrawn, onPolygonCleared]);

  return null;
}

function extractPolygonCoordinates(layer: any): Polygon | null {
  if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
    const latLngs = layer.getLatLngs()[0];
    return latLngs.map((latLng: L.LatLng) => ({
      lat: latLng.lat,
      lng: latLng.lng
    }));
  } else if (layer instanceof L.Circle) {
    const center = layer.getLatLng();
    const radius = layer.getRadius();
    const points = 32;
    const polygon: Polygon = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radius * Math.cos(angle);
      const dy = radius * Math.sin(angle);

      const lat = center.lat + (dy / 111320);
      const lng = center.lng + (dx / (111320 * Math.cos(center.lat * Math.PI / 180)));

      polygon.push({ lat, lng });
    }

    return polygon;
  }

  return null;
}
