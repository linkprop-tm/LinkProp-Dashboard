import { supabase } from '../supabase';
import type { Usuario, TipoPropiedad, TipoOperacion } from '../database.types';

export interface CreateUsuarioData {
  email: string;
  nombre: string;
  telefono?: string;
  preferencias_tipo?: TipoPropiedad[];
  preferencias_operacion?: TipoOperacion;
  preferencias_precio_min?: number;
  preferencias_precio_max?: number;
  preferencias_ubicacion?: string[];
  preferencias_dormitorios_min?: number;
  preferencias_banos_min?: number;
}

export interface UpdateUsuarioData extends Partial<CreateUsuarioData> {
  id: string;
}

export async function crearUsuario(data: CreateUsuarioData) {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) throw error;
  return usuario as Usuario;
}

export async function obtenerUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data as Usuario[];
}

export async function obtenerUsuarioPorId(id: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Usuario | null;
}

export async function obtenerUsuarioPorEmail(email: string) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data as Usuario | null;
}

export async function actualizarUsuario(data: UpdateUsuarioData) {
  const { id, ...updateData } = data;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return usuario as Usuario;
}

export async function eliminarUsuario(id: string) {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function actualizarPreferencias(
  usuario_id: string,
  preferencias: Partial<Pick<Usuario,
    'preferencias_tipo' |
    'preferencias_operacion' |
    'preferencias_precio_min' |
    'preferencias_precio_max' |
    'preferencias_ubicacion' |
    'preferencias_dormitorios_min' |
    'preferencias_banos_min'
  >>
) {
  return actualizarUsuario({ id: usuario_id, ...preferencias });
}

export async function obtenerRelacionesPorUsuario(usuario_id: string) {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select(`
      *,
      propiedades (*)
    `)
    .eq('usuario_id', usuario_id)
    .order('fecha_creacion', { ascending: false });

  if (error) throw error;
  return data;
}

export async function obtenerPropiedadesPorEtapa(usuario_id: string, etapa: string) {
  const { data, error } = await supabase
    .from('propiedades_usuarios')
    .select(`
      *,
      propiedades (*)
    `)
    .eq('usuario_id', usuario_id)
    .eq('etapa', etapa)
    .order('fecha_actualizacion', { ascending: false });

  if (error) throw error;
  return data;
}
