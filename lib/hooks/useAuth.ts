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
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching user role:', error);
      return 'client';
    }

    return data.role as UserRole;
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

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role,
        name: profileData.name,
        phone: profileData.phone,
      });

    if (profileError) throw profileError;

    // If client, create preferences
    if (role === 'client' && profileData.preferences) {
      const { error: prefsError } = await supabase
        .from('preferences')
        .insert({
          user_id: authData.user.id,
          ...profileData.preferences,
        });

      if (prefsError) throw prefsError;
    }

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
