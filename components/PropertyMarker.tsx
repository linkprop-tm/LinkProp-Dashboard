import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../types';

interface PropertyMarkerProps {
  property: Property;
  onClick?: (property: Property) => void;
  isSelected?: boolean;
}

function getMarkerIcon(property: Property, isSelected: boolean): L.Icon {
  const color = isSelected
    ? '#3b82f6'
    : property.status === 'active'
      ? '#22c55e'
      : property.status === 'pending'
        ? '#f59e0b'
        : '#ef4444';

  const markerHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        ${property.currency}
      </span>
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

export default function PropertyMarker({ property, onClick, isSelected = false }: PropertyMarkerProps) {
  if (!property.latitud || !property.longitud) {
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick(property);
    }
  };

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: property.currency === 'USD' ? 'USD' : 'ARS',
    maximumFractionDigits: 0
  }).format(property.price);

  const thumbnailUrl = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://via.placeholder.com/200x150?text=Sin+Imagen';

  return (
    <Marker
      position={[property.latitud, property.longitud]}
      icon={getMarkerIcon(property, isSelected)}
      eventHandlers={{
        click: handleClick
      }}
    >
      <Popup maxWidth={280}>
        <div style={{ minWidth: '200px' }}>
          <div style={{ marginBottom: '8px' }}>
            <img
              src={thumbnailUrl}
              alt={property.propertyType || 'Propiedad'}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Sin+Imagen';
              }}
            />
          </div>

          <div style={{ fontSize: '14px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              {precioFormateado}
            </div>

            <div style={{ color: '#666', marginBottom: '4px' }}>
              {property.propertyType} en {property.operationType}
            </div>

            <div style={{ marginBottom: '4px', display: 'flex', gap: '8px', fontSize: '12px', color: '#888' }}>
              {property.bedrooms && property.bedrooms > 0 && (
                <span>{property.bedrooms} dorm</span>
              )}
              {property.bathrooms && property.bathrooms > 0 && (
                <span>{property.bathrooms} baños</span>
              )}
              {property.totalArea && property.totalArea > 0 && (
                <span>{property.totalArea} m²</span>
              )}
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              {property.neighborhood}{property.province ? `, ${property.province}` : ''}
            </div>

            <div style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '500',
              display: 'inline-block',
              background: property.status === 'active'
                ? '#dcfce7'
                : property.status === 'pending'
                  ? '#fef3c7'
                  : '#fee2e2',
              color: property.status === 'active'
                ? '#166534'
                : property.status === 'pending'
                  ? '#92400e'
                  : '#991b1b'
            }}>
              {property.status === 'active' ? 'Disponible' : property.status === 'pending' ? 'Reservada' : 'Vendida'}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
