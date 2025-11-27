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
    address: propiedad.direccion || propiedad.ubicacion,
    price: propiedad.precio,
    currency: propiedad.moneda,
    imageUrl: propiedad.imagenes?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    images: propiedad.imagenes,
    views: 0,
    matchesCount: matchCount || 0,
    interestedClients: interesadosCount || 0,
    status: statusMap[propiedad.estado] || 'active',
    isVisible: propiedad.visibilidad === 'Publica',
    addedAt: propiedad.fecha_creacion,
    propertyType: propiedad.tipo,
    operationType: propiedad.operacion,
    description: propiedad.descripcion,
    totalArea: propiedad.m2_totales || propiedad.superficie,
    coveredArea: propiedad.m2_cubiertos || undefined,
    environments: propiedad.ambientes,
    bedrooms: propiedad.dormitorios,
    bathrooms: propiedad.banos,
    antiquity: propiedad.antiguedad ? (isNaN(Number(propiedad.antiguedad)) ? undefined : Number(propiedad.antiguedad)) : undefined,
    expenses: propiedad.expensas,
    isCreditSuitable: propiedad.apto_credito,
    isProfessionalSuitable: propiedad.apto_profesional,
    orientation: propiedad.orientacion || undefined,
    hasGarage: propiedad.cochera,
    neighborhood: propiedad.barrio || propiedad.ubicacion,
    province: propiedad.provincia || undefined,
    fullAddress: propiedad.direccion || undefined,
    sourceUrl: propiedad.url_original || undefined,
    sourcePortal: propiedad.portal_original || undefined,
    area: propiedad.m2_totales || propiedad.superficie
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
    result.m2_totales = property.totalArea || property.area || null;
  }
  if (property.coveredArea !== undefined) result.m2_cubiertos = property.coveredArea;
  if (property.environments !== undefined) result.ambientes = property.environments;
  if (property.antiquity !== undefined) result.antiguedad = String(property.antiquity);
  if (property.expenses !== undefined) result.expensas = property.expenses;
  if (property.isCreditSuitable !== undefined) result.apto_credito = property.isCreditSuitable;
  if (property.isProfessionalSuitable !== undefined) result.apto_profesional = property.isProfessionalSuitable;
  if (property.orientation) result.orientacion = property.orientation;
  if (property.hasGarage !== undefined) result.cochera = property.hasGarage;
  if (property.fullAddress) result.direccion = property.fullAddress;
  if (property.neighborhood) result.barrio = property.neighborhood;
  if (property.province) result.provincia = property.province;
  if (property.isVisible !== undefined) result.visibilidad = property.isVisible ? 'Publica' : 'Privada';
  if (property.sourceUrl) result.url_original = property.sourceUrl;
  if (property.sourcePortal) result.portal_original = property.sourcePortal;
  if (property.images) result.imagenes = property.images;
  if (property.status) result.estado = estadoMap[property.status] || 'Disponible';

  return result;
}
