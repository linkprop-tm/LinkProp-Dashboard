import { supabase } from '../supabase';
import type { Propiedad, PropiedadUsuario, EstadoPropiedad } from '../database.types';

export interface CreatePropiedadData {
  descripcion?: string;
  tipo: Propiedad['tipo'];
  operacion: Propiedad['operacion'];
  precio: number;
  moneda?: Propiedad['moneda'];
  dormitorios?: number;
  banos?: number;
  superficie?: number;
  imagenes?: string[];
  estado?: EstadoPropiedad;
  direccion?: string;
  barrio?: string;
  provincia?: string;
}

export interface UpdatePropiedadData extends Partial<CreatePropiedadData> {
  id: string;
}

export async function crearPropiedad(data: CreatePropiedadData) {
  const { data: propiedad, error } = await supabase
    .from('propiedades')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) throw error;
  return propiedad;
}

export async function obtenerPropiedades(filtros?: {
  tipo?: string;
  operacion?: string;
  estado?: EstadoPropiedad;
  precio_min?: number;
  precio_max?: number;
}) {
  let query = supabase
    .from('propiedades')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo);
  }
  if (filtros?.operacion) {
    query = query.eq('operacion', filtros.operacion);
  }
  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado);
  }
  if (filtros?.precio_min !== undefined) {
    query = query.gte('precio', filtros.precio_min);
  }
  if (filtros?.precio_max !== undefined) {
    query = query.lte('precio', filtros.precio_max);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Propiedad[];
}

export async function obtenerPropiedadPorId(id: string) {
  const { data, error } = await supabase
    .from('propiedades')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Propiedad | null;
}

export async function actualizarPropiedad(data: UpdatePropiedadData) {
  const { id, ...updateData } = data;

  const { data: propiedad, error } = await supabase
    .from('propiedades')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return propiedad;
}

export async function eliminarPropiedad(id: string) {
  const { error } = await supabase
    .from('propiedades')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function obtenerPropiedadesDisponibles() {
  return obtenerPropiedades({ estado: 'Disponible' });
}

export async function cambiarEstadoPropiedad(id: string, estado: EstadoPropiedad) {
  return actualizarPropiedad({ id, estado });
}

export async function actualizarEstadoPropiedadManual(
  id: string,
  estado: EstadoPropiedad,
  estadoManual: boolean = true
) {
  const { data, error } = await supabase
    .from('propiedades')
    .update({
      estado,
      estado_manual: estadoManual,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Propiedad;
}

export async function cambiarVisibilidadPropiedad(id: string, visibilidad: 'Publica' | 'Privada') {
  const { data, error } = await supabase
    .from('propiedades')
    .update({ visibilidad })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Propiedad;
}

export async function obtenerRelacionesPorPropiedad(propiedad_id: string) {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select(`
      *,
      usuarios (*)
    `)
    .eq('propiedad_id', propiedad_id)
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data;
}

export async function contarInteresadosPorPropiedad(propiedad_id: string) {
  const { count, error } = await supabase
    .from('propiedades_usuarios')
    .select('*', { count: 'exact', head: true })
    .eq('propiedad_id', propiedad_id)
    .in('etapa', ['Interes', 'Visitada']);

  if (error) throw error;
  return count || 0;
}

export async function actualizarCoordenadasPropiedad(
  id: string,
  latitud: number,
  longitud: number
) {
  const { data, error } = await supabase
    .from('propiedades')
    .update({ latitud, longitud })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Propiedad;
}

export async function obtenerPropiedadesConCoordenadas() {
  const { data, error } = await supabase
    .from('propiedades')
    .select('*')
    .not('latitud', 'is', null)
    .not('longitud', 'is', null)
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data as Propiedad[];
}

export async function obtenerPropiedadesSinCoordenadas() {
  const { data, error } = await supabase
    .from('propiedades')
    .select('*')
    .or('latitud.is.null,longitud.is.null')
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data as Propiedad[];
}
