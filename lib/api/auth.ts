import { supabase } from '../supabase';
import { Usuario } from '../../types';

export interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
  preferencias_tipo: string[];
  preferencias_operacion: string | null;
  preferencias_precio_min: number | null;
  preferencias_precio_max: number | null;
  preferencias_ubicacion: string[];
  preferencias_dormitorios_min: number | null;
  preferencias_banos_min: number | null;
}

export type UserRole = 'agent' | 'client' | null;

export interface AuthError {
  message: string;
  code?: string;
}

export const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: AuthError }> => {
  try {
    const { email, password, ...userData } = data;

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          nombre: userData.nombre,
        },
      },
    });

    if (signUpError) {
      return {
        success: false,
        error: {
          message: signUpError.message === 'User already registered'
            ? 'Este email ya está registrado'
            : 'Error al crear la cuenta',
          code: signUpError.code,
        },
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: { message: 'Error al crear la cuenta' },
      };
    }

    const { error: insertError } = await supabase.from('usuarios').insert({
      auth_id: authData.user.id,
      email: email,
      nombre: userData.nombre,
      telefono: userData.telefono,
      preferencias_tipo: userData.preferencias_tipo,
      preferencias_operacion: userData.preferencias_operacion,
      preferencias_precio_min: userData.preferencias_precio_min,
      preferencias_precio_max: userData.preferencias_precio_max,
      preferencias_ubicacion: userData.preferencias_ubicacion,
      preferencias_dormitorios_min: userData.preferencias_dormitorios_min,
      preferencias_banos_min: userData.preferencias_banos_min,
    });

    if (insertError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        error: { message: 'Error al guardar datos del usuario' },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'Error de conexión, intenta nuevamente' },
    };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: AuthError }> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : 'Error al iniciar sesión',
          code: error.code,
        },
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: 'Error de conexión, intenta nuevamente' },
    };
  }
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSessionOnLoad = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUserRole = async (): Promise<UserRole> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (adminData) {
      return 'agent';
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (userData) {
      return 'client';
    }

    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
