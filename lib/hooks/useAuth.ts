import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { UserRole } from '../../App';

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

    // Create user profile in usuarios table
    const { error: profileError } = await supabase
      .from('usuarios')
      .insert({
        auth_id: authData.user.id,
        email,
        rol: dbRole,
        full_name: profileData.name,
        estado_usuario: 'Activo',
        // If client, add preferences
        ...(role === 'client' && profileData.preferences ? {
          preferencias_tipo: profileData.preferences.property_types || [],
          preferencias_operacion: profileData.preferences.operation_type || null,
          preferencias_precio_min: profileData.preferences.min_price || null,
          preferencias_precio_max: profileData.preferences.max_price || null,
          preferencias_ubicacion: profileData.preferences.neighborhoods || [],
          preferencias_zona_geografica: profileData.preferences.geographic_zone || null,
          preferencias_m2_min: profileData.preferences.min_area ? parseFloat(profileData.preferences.min_area) : null,
          preferencias_ambientes: profileData.preferences.environments || null,
          preferencias_amenities: profileData.preferences.amenities || [],
          preferencias_apto_credito: profileData.preferences.credit || false,
          preferencias_apto_profesional: profileData.preferences.professional || false,
          preferencias_cochera: profileData.preferences.garage || false,
          preferencias_apto_mascotas: profileData.preferences.pets || false,
        } : {}),
      });

    if (profileError) throw profileError;

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
