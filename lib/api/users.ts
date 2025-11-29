import { supabase } from '../supabase';
import type { Usuario, TipoPropiedad, TipoOperacion } from '../database.types';

export interface CreateUsuarioData {
  email: string;
  full_name: string;
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
    .eq('rol', 'user')
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
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const { data: userToDelete, error: fetchError } = await supabase
    .from('usuarios')
    .select('auth_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    throw new Error('Failed to fetch user data');
  }

  const { error: deleteDbError } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (deleteDbError) {
    throw new Error('Failed to delete user from database');
  }

  if (userToDelete?.auth_id) {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`;

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: id, authId: userToDelete.auth_id }),
    }).catch(err => {
      console.error('Background auth deletion error:', err);
    });
  }

  return { success: true };
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
