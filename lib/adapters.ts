import type { Property } from '../types';
import type { Propiedad } from './database.types';

export function propiedadToProperty(propiedad: Propiedad, matchCount?: number, interesadosCount?: number): Property {
  const statusMap: Record<string, 'active' | 'pending' | 'sold'> = {
    'Disponible': 'active',
    'Reservada': 'pending',
    'Vendida': 'sold'
  };

  return {
    id: propiedad.id,
    title: propiedad.titulo,
    address: propiedad.ubicacion,
    price: propiedad.precio,
    currency: propiedad.moneda,
    imageUrl: propiedad.imagenes?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    images: propiedad.imagenes,
    views: 0,
    matchesCount: matchCount || 0,
    interestedClients: interesadosCount || 0,
    status: statusMap[propiedad.estado] || 'active',
    isVisible: propiedad.estado === 'Disponible',
    addedAt: propiedad.fecha_creacion,
    propertyType: propiedad.tipo,
    operationType: propiedad.operacion,
    description: propiedad.descripcion,
    totalArea: propiedad.superficie,
    bedrooms: propiedad.dormitorios,
    bathrooms: propiedad.banos,
    neighborhood: propiedad.ubicacion,
    area: propiedad.superficie
  };
}

export function propertyToPropiedad(property: Partial<Property>): Partial<Propiedad> {
  const estadoMap: Record<string, 'Disponible' | 'Reservada' | 'Vendida'> = {
    'active': 'Disponible',
    'pending': 'Reservada',
    'sold': 'Vendida'
  };

  const result: Partial<Propiedad> = {};

  if (property.title) result.titulo = property.title;
  if (property.description) result.descripcion = property.description;
  if (property.propertyType) result.tipo = property.propertyType as Propiedad['tipo'];
  if (property.operationType) result.operacion = property.operationType;
  if (property.price !== undefined) result.precio = property.price;
  if (property.currency) result.moneda = property.currency as Propiedad['moneda'];
  if (property.address || property.neighborhood) result.ubicacion = property.address || property.neighborhood || '';
  if (property.bedrooms !== undefined) result.dormitorios = property.bedrooms;
  if (property.bathrooms !== undefined) result.banos = property.bathrooms;
  if (property.totalArea !== undefined || property.area !== undefined) {
    result.superficie = property.totalArea || property.area || 0;
  }
  if (property.images) result.imagenes = property.images;
  if (property.status) result.estado = estadoMap[property.status] || 'Disponible';

  return result;
}
