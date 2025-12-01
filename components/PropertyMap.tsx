import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Property } from '../types';
import { isValidCoordinate, loadMapPosition, saveMapPosition, Coordinate, Polygon } from '../lib/geo-utils';
import PropertyMarker from './PropertyMarker';
import DrawControl from './DrawControl';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
  selectedPropertyId?: string | null;
  drawnPolygon?: Coordinate[] | null;
  onPolygonDrawn?: (polygon: Polygon) => void;
  onPolygonCleared?: () => void;
}

function MapPositionHandler() {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      saveMapPosition({ lat: center.lat, lng: center.lng }, zoom);
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleMoveEnd);
    };
  }, [map]);

  return null;
}

export default function PropertyMap({
  properties,
  onPropertyClick,
  selectedPropertyId,
  drawnPolygon,
  onPolygonDrawn,
  onPolygonCleared
}: PropertyMapProps) {
  const defaultCenter: [number, number] = [-34.6037, -58.3816];
  const defaultZoom = 12;

  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(defaultZoom);

  useEffect(() => {
    const savedPosition = loadMapPosition();
    if (savedPosition) {
      setCenter([savedPosition.center.lat, savedPosition.center.lng]);
      setZoom(savedPosition.zoom);
    }
  }, []);

  const validProperties = properties.filter(p =>
    isValidCoordinate(p.latitud, p.longitud)
  );

  if (validProperties.length === 0) {
    return (
      <div style={{
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: '8px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No hay propiedades con ubicación para mostrar en el mapa
          </p>
          <p style={{ fontSize: '0.9rem', color: '#999' }}>
            Las propiedades necesitan coordenadas geográficas para aparecer en el mapa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '600px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapPositionHandler />

        <DrawControl
          onPolygonDrawn={onPolygonDrawn}
          onPolygonCleared={onPolygonCleared}
          initialPolygon={drawnPolygon}
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
        >
          {validProperties.map(property => (
            <PropertyMarker
              key={property.id}
              property={property}
              onClick={onPropertyClick}
              isSelected={selectedPropertyId === property.id}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
