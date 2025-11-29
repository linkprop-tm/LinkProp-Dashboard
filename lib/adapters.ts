import type { Property, Client } from '../types';
import type { Propiedad, Usuario } from './database.types';

export function usuarioToClient(usuario: Usuario): Client {
  return {
    id: usuario.id,
    name: usuario.full_name || 'Usuario sin nombre',
    email: usuario.email || '',
    avatar: usuario.foto_perfil_url || '',
    phone: usuario.telefono || '',
    date: usuario.fecha_creacion
      ? new Date(usuario.fecha_creacion).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : '',
    groups: [],
    searchParams: {
      type: usuario.preferencias_tipo?.[0] || '',
      maxPrice: usuario.preferencias_precio_max || 0,
      minPrice: usuario.preferencias_precio_min || 0,
      currency: 'USD',
      environments: usuario.preferencias_ambientes || '',
      location: usuario.preferencias_ubicacion?.[0] || '',
      neighborhoods: usuario.preferencias_ubicacion || [],
      operationType: usuario.preferencias_operacion || 'Venta',
      propertyTypes: usuario.preferencias_tipo || [],
      bedrooms: '',
      bathrooms: '',
      amenities: usuario.preferencias_amenities || [],
      minArea: usuario.preferencias_m2_min || undefined,
      maxArea: undefined,
      antiquity: usuario.preferencias_antiguedad || [],
      hasGarage: usuario.preferencias_cochera || false,
      isCreditSuitable: usuario.preferencias_apto_credito || false,
      isProfessionalSuitable: usuario.preferencias_apto_profesional || false,
      isPetFriendly: usuario.preferencias_apto_mascotas || false
    },
    activityScore: 75,
    status: 'active'
  };
}

export function clientToUsuario(client: Client): Partial<Usuario> {
  return {
    id: client.id,
    full_name: client.name,
    email: client.email,
    telefono: client.phone || '',
    preferencias_tipo: client.searchParams.propertyTypes && client.searchParams.propertyTypes.length > 0
      ? client.searchParams.propertyTypes
      : (client.searchParams.type ? [client.searchParams.type] : []),
    preferencias_operacion: client.searchParams.operationType || 'Venta',
    preferencias_precio_min: client.searchParams.minPrice || null,
    preferencias_precio_max: client.searchParams.maxPrice || null,
    preferencias_ubicacion: client.searchParams.location
      ? [client.searchParams.location]
      : [],
    preferencias_m2_min: client.searchParams.minArea || null,
    preferencias_ambientes: client.searchParams.environments?.toString() || null,
    preferencias_amenities: client.searchParams.amenities || [],
    preferencias_antiguedad: client.searchParams.antiquity || [],
    preferencias_apto_credito: client.searchParams.isCreditSuitable || null,
    preferencias_apto_profesional: client.searchParams.isProfessionalSuitable || null,
    preferencias_cochera: client.searchParams.hasGarage || null,
    preferencias_apto_mascotas: client.searchParams.isPetFriendly || null
  };
}

export function propiedadToProperty(propiedad: Propiedad, matchCount?: number, interesadosCount?: number): Property {
  const statusMap: Record<string, 'active' | 'pending' | 'sold'> = {
    'Disponible': 'active',
    'Reservada': 'pending',
    'Vendida': 'sold'
  };

  return {
    id: propiedad.id,
    title: propiedad.titulo,
    address: propiedad.direccion,
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
    neighborhood: propiedad.barrio,
    province: propiedad.provincia || undefined,
    fullAddress: propiedad.direccion || undefined,
    sourceUrl: propiedad.url_original || undefined,
    sourcePortal: propiedad.portal_original || undefined,
    amenities: propiedad.amenities || [],
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

  if (property.address) result.direccion = property.address;

  if (property.bedrooms !== undefined) result.dormitorios = property.bedrooms;
  if (property.bathrooms !== undefined) result.banos = property.bathrooms;

  if (property.totalArea !== undefined || property.area !== undefined) {
    result.m2_totales = property.totalArea || property.area || null;
  }
  if (property.coveredArea !== undefined) result.m2_cubiertos = property.coveredArea || null;
  if (property.environments !== undefined) result.ambientes = property.environments;
  if (property.antiquity !== undefined) result.antiguedad = String(property.antiquity);
  if (property.expenses !== undefined) result.expensas = property.expenses;
  if (property.isCreditSuitable !== undefined) result.apto_credito = property.isCreditSuitable;
  if (property.isProfessionalSuitable !== undefined) result.apto_profesional = property.isProfessionalSuitable;
  if (property.orientation) result.orientacion = property.orientation;
  if (property.hasGarage !== undefined) result.cochera = property.hasGarage;
  if (property.neighborhood) result.barrio = property.neighborhood;
  if (property.province) result.provincia = property.province;
  if (property.isVisible !== undefined) result.visibilidad = property.isVisible ? 'Publica' : 'Privada';
  if (property.sourceUrl) result.url_original = property.sourceUrl;
  if (property.sourcePortal) result.portal_original = property.sourcePortal;
  if (property.images && property.images.length > 0) result.imagenes = property.images;
  if (property.status) result.estado = estadoMap[property.status] || 'Disponible';
  if (property.amenities !== undefined) result.amenities = property.amenities;

  return result;
}
