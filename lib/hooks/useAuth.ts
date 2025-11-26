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
    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('auth_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching user role:', error);
      return 'client';
    }

    return (data.rol === 'admin' ? 'agent' : 'client') as UserRole;
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
        telefono: profileData.phone,
        // If client, add preferences
        ...(role === 'client' && profileData.preferences ? {
          preferencias_tipo: profileData.preferences.propertyTypes,
          preferencias_operacion: profileData.preferences.operationType,
          preferencias_precio_min: profileData.preferences.minPrice ? parseFloat(profileData.preferences.minPrice) : null,
          preferencias_precio_max: profileData.preferences.maxPrice ? parseFloat(profileData.preferences.maxPrice) : null,
          preferencias_ubicacion: profileData.preferences.neighborhoods,
          preferencias_dormitorios_min: profileData.preferences.bedrooms ? parseInt(profileData.preferences.bedrooms) : null,
          preferencias_banos_min: profileData.preferences.bathrooms ? parseInt(profileData.preferences.bathrooms) : null,
        } : {}),
      });

    if (profileError) throw profileError;

    return authData;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setAuthState({ user: null, role: null, loading: false });
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
