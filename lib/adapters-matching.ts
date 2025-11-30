import type { Usuario, Propiedad } from './database.types';
import type { Client, Property } from '../types';
import type { UsuarioConMatches, MatchConPropiedad } from './api/matches';

export function transformUsuarioToClient(usuario: Usuario): Client {
  const primerTipo = usuario.preferencias_tipo?.[0] || 'Departamento';
  const primeraUbicacion = usuario.preferencias_ubicacion?.[0] || 'Sin especificar';

  return {
    id: usuario.id,
    name: usuario.full_name,
    email: usuario.email,
    avatar: usuario.foto_perfil_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(usuario.full_name)}&background=random`,
    date: new Date(usuario.fecha_creacion).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    groups: [],
    searchParams: {
      type: primerTipo,
      operationType: usuario.preferencias_operacion || 'Venta',
      maxPrice: usuario.preferencias_precio_max || 0,
      currency: 'USD',
      environments: usuario.preferencias_ambientes || '2',
      location: primeraUbicacion,
      hasGarage: usuario.preferencias_cochera || false,
      isCreditSuitable: usuario.preferencias_apto_credito || false,
      isProfessionalSuitable: usuario.preferencias_apto_profesional || false
    },
    activityScore: 0,
    status: usuario.estado_usuario === 'Activo' ? 'active' : 'inactive'
  };
}

export function transformPropiedadToProperty(propiedad: Propiedad): Property {
  const primeraImagen = propiedad.imagenes?.[0] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop';

  return {
    id: propiedad.id,
    title: `${propiedad.tipo} en ${propiedad.barrio || propiedad.provincia || 'Sin ubicación'}`,
    description: propiedad.descripcion,
    address: propiedad.direccion,
    price: propiedad.precio,
    currency: propiedad.moneda,
    imageUrl: primeraImagen,
    images: propiedad.imagenes?.length > 0 ? propiedad.imagenes : [primeraImagen],
    views: 0,
    matchesCount: 0,
    interestedClients: 0,
    status: propiedad.estado === 'Disponible' ? 'active' : 'pending',
    isVisible: propiedad.visibilidad === 'Publica',
    addedAt: new Date(propiedad.fecha_creacion).toISOString().split('T')[0],

    propertyType: propiedad.tipo,
    operationType: propiedad.operacion,

    area: propiedad.m2_totales || propiedad.superficie,
    totalArea: propiedad.m2_totales || propiedad.superficie,
    coveredArea: propiedad.m2_cubiertos || propiedad.superficie,

    environments: propiedad.ambientes,
    bedrooms: propiedad.dormitorios,
    bathrooms: propiedad.banos,

    antiquity: parseInt(propiedad.antiguedad) || 0,
    expenses: propiedad.expensas,

    isCreditSuitable: propiedad.apto_credito,
    isProfessionalSuitable: propiedad.apto_profesional,
    orientation: propiedad.orientacion,

    amenities: propiedad.amenities || [],

    neighborhood: propiedad.barrio,
    province: propiedad.provincia
  };
}

export interface MatchData {
  id: string;
  client: Client;
  property: Property;
  score: number;
  status: string;
  reason: string;
}

export function transformMatchToUI(match: MatchConPropiedad): MatchData {
  return {
    id: match.id,
    client: transformUsuarioToClient(match.usuario),
    property: transformPropiedadToProperty(match.propiedad),
    score: match.porcentaje_match,
    status: 'new',
    reason: match.criterios_coincidentes.join(', ')
  };
}
