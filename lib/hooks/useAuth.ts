import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { UserRole } from '../../App';
import { enviarWebhookRegistro } from '../api/webhook';

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setAuthState({ user: session.user, role, loading: false });
        } else {
          setAuthState({ user: null, role: null, loading: false });
        }
      })();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const role = await getUserRole(session.user.id);
          setAuthState({ user: session.user, role, loading: false });
        } else {
          setAuthState({ user: null, role: null, loading: false });
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserRole = async (userId: string): Promise<UserRole> => {
    console.log('[getUserRole] Fetching role for userId:', userId);

    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_id', userId)
      .maybeSingle();

    console.log('[getUserRole] Query result:', { data, error, userId });

    if (error) {
      console.error('[getUserRole] Database error:', error);
      return 'client';
    }

    if (!data) {
      console.warn('[getUserRole] No user record found for userId:', userId);
      return 'client';
    }

    const mappedRole = (data.rol === 'admin' ? 'agent' : 'client') as UserRole;
    console.log('[getUserRole] Mapped role:', { dbRole: data.rol, mappedRole });

    return mappedRole;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, role: UserRole, profileData: any) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // Map role to database role
    const dbRole = role === 'agent' ? 'admin' : 'user';

    // Helper function to convert avenue preference string to boolean or null
    const convertAvenuePreference = (pref: string | undefined | null): boolean | null => {
      if (!pref || pref === 'Indiferente') return null;
      if (pref === 'Sí') return true;
      if (pref === 'No') return false;
      return null;
    };

    // Helper function to convert orientation preference string to enum or null
    const convertOrientationPreference = (pref: string | undefined | null): 'Frente' | 'Contrafrente' | null => {
      if (!pref || pref === 'Indiferente') return null;
      if (pref === 'Frente' || pref === 'Contrafrente') return pref;
      return null;
    };

    // Helper function to convert floor preference string or null
    const convertFloorPreference = (pref: string | undefined | null): string | null => {
      if (!pref || pref === 'Indiferente') return null;
      return pref;
    };

    // Create user profile in usuarios table
    const insertData = {
      auth_id: authData.user.id,
      email,
      rol: dbRole,
      full_name: profileData.name,
      // If client, add preferences
      ...(role === 'client' && profileData.preferences ? {
        preferencias_tipo: profileData.preferences.property_types || [],
        preferencias_operacion: profileData.preferences.operation_type || 'Venta',
        preferencias_precio_min: profileData.preferences.min_price || null,
        preferencias_precio_max: profileData.preferences.max_price || null,
        preferencias_ubicacion: profileData.preferences.neighborhoods || [],
        preferencias_zona_geografica: profileData.preferences.geographic_zone || null,
        preferencias_m2_min: profileData.preferences.min_area ? parseFloat(profileData.preferences.min_area) : null,
        preferencias_ambientes: profileData.preferences.environments || null,
        preferencias_antiguedad: profileData.preferences.antiguedad || 'Indiferente',
        preferencias_amenities: profileData.preferences.amenities || [],
        preferencias_apto_credito: profileData.preferences.credit || false,
        preferencias_apto_profesional: profileData.preferences.professional || false,
        preferencias_cochera: profileData.preferences.garage || false,
        preferencias_apto_mascotas: profileData.preferences.pets || false,
        // Department-specific preferences
        preferencias_piso_minimo: convertFloorPreference(profileData.preferences.min_floor),
        preferencias_avenida: convertAvenuePreference(profileData.preferences.avenue_preference),
        preferencias_orientacion: convertOrientationPreference(profileData.preferences.front_preference),
      } : {}),
    };

    console.log('[SignUp] Insertando usuario en tabla usuarios:', { email, rol: dbRole });

    const { error: profileError } = await supabase
      .from('usuarios')
      .insert(insertData);

    if (profileError) {
      console.error('[SignUp] Error al insertar usuario en tabla usuarios:', profileError);
      throw profileError;
    }

    console.log('[SignUp] Usuario insertado exitosamente en tabla usuarios');

    if (role === 'client' && profileData.preferences) {
      try {
        console.log('[SignUp] Enviando webhook de registro...');
        await enviarWebhookRegistro(profileData.name, profileData.preferences);
        console.log('[SignUp] Webhook enviado exitosamente');
      } catch (error) {
        console.error('[SignUp] Error al enviar webhook (no afecta registro):', error);
      }
    }

    return authData;
  };

  const signOut = async () => {
    console.log('[signOut] Starting logout process...');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[signOut] Supabase signOut error:', error);
        throw error;
      }

      console.log('[signOut] Supabase signOut successful');
      setAuthState({ user: null, role: null, loading: false });
      console.log('[signOut] Local state cleared');
    } catch (error) {
      console.error('[signOut] Error during logout:', error);
      console.log('[signOut] Forcing local state cleanup despite error');
      setAuthState({ user: null, role: null, loading: false });
      throw error;
    }
  };

  return {
    user: authState.user,
    role: authState.role,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
  };
}
