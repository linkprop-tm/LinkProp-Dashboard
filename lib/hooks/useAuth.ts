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

  const verificarUsuarioEnBD = async (authId: string, email: string): Promise<boolean> => {
    const maxIntentos = 5;
    const delayEntreIntentos = 500;

    console.log('[SignUp] Iniciando verificación de usuario en BD:', {
      authId,
      email,
      maxIntentos,
      delayEntreIntentos,
      timestamp: new Date().toISOString(),
    });

    for (let intento = 1; intento <= maxIntentos; intento++) {
      console.log(`[SignUp] Verificación - Intento ${intento}/${maxIntentos}`, {
        authId,
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, auth_id, rol')
        .eq('auth_id', authId)
        .maybeSingle();

      if (error) {
        console.error(`[SignUp] Verificación - Intento ${intento} - Error en consulta:`, {
          error,
          authId,
          timestamp: new Date().toISOString(),
        });
      } else if (data) {
        console.log(`[SignUp] ✓ Verificación exitosa en intento ${intento}:`, {
          usuario: data,
          timestamp: new Date().toISOString(),
        });
        return true;
      } else {
        console.log(`[SignUp] Verificación - Intento ${intento} - Usuario no encontrado aún`, {
          authId,
          timestamp: new Date().toISOString(),
        });
      }

      if (intento < maxIntentos) {
        console.log(`[SignUp] ⏳ Esperando ${delayEntreIntentos}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delayEntreIntentos));
      }
    }

    console.error('[SignUp] ✗ FALLO: No se pudo verificar la existencia del usuario después de', maxIntentos, 'intentos');
    return false;
  };

  const signUp = async (email: string, password: string, role: UserRole, profileData: any) => {
    const startTime = new Date();
    console.log('[SignUp] ========================================');
    console.log('[SignUp] INICIO DEL PROCESO DE REGISTRO');
    console.log('[SignUp] ========================================');
    console.log('[SignUp] Datos:', {
      email,
      role,
      timestamp: startTime.toISOString(),
    });

    let authData;
    try {
      console.log('[SignUp] Paso 1: Creando usuario en auth.users...');
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('[SignUp] Error al crear usuario en auth.users:', authError);
        throw authError;
      }
      if (!data.user) {
        console.error('[SignUp] No se recibió usuario de signUp');
        throw new Error('No user returned from signup');
      }

      authData = data;
      console.log('[SignUp] ✓ Usuario creado en auth.users:', {
        authId: data.user.id,
        email: data.user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[SignUp] ✗ FALLO en Paso 1 (auth.users)');
      throw error;
    }

    const dbRole = role === 'agent' ? 'admin' : 'user';

    const convertAvenuePreference = (pref: string | undefined | null): boolean | null => {
      if (!pref || pref === 'Indiferente') return null;
      if (pref === 'Sí') return true;
      if (pref === 'No') return false;
      return null;
    };

    const convertOrientationPreference = (pref: string | undefined | null): 'Frente' | 'Contrafrente' | null => {
      if (!pref || pref === 'Indiferente') return null;
      if (pref === 'Frente' || pref === 'Contrafrente') return pref;
      return null;
    };

    const convertFloorPreference = (pref: string | undefined | null): string | null => {
      if (!pref || pref === 'Indiferente') return null;
      return pref;
    };

    const insertData = {
      auth_id: authData.user.id,
      email,
      rol: dbRole,
      full_name: profileData.name,
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
        preferencias_piso_minimo: convertFloorPreference(profileData.preferences.min_floor),
        preferencias_avenida: convertAvenuePreference(profileData.preferences.avenue_preference),
        preferencias_orientacion: convertOrientationPreference(profileData.preferences.front_preference),
      } : {}),
    };

    try {
      console.log('[SignUp] Paso 2: Insertando usuario en tabla usuarios...', {
        authId: authData.user.id,
        email,
        rol: dbRole,
        timestamp: new Date().toISOString(),
      });

      const { error: profileError } = await supabase
        .from('usuarios')
        .insert(insertData);

      if (profileError) {
        console.error('[SignUp] ✗ Error al insertar usuario en tabla usuarios:', {
          error: profileError,
          authId: authData.user.id,
          timestamp: new Date().toISOString(),
        });

        console.log('[SignUp] Limpiando usuario huérfano en auth.users...');
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log('[SignUp] Usuario huérfano eliminado de auth.users');
        } catch (cleanupError) {
          console.error('[SignUp] Error al limpiar usuario huérfano:', cleanupError);
        }

        throw profileError;
      }

      console.log('[SignUp] ✓ INSERT ejecutado en tabla usuarios');
    } catch (error) {
      console.error('[SignUp] ✗ FALLO en Paso 2 (tabla usuarios)');
      throw error;
    }

    try {
      console.log('[SignUp] Paso 3: Verificando existencia del usuario en BD...');
      const usuarioVerificado = await verificarUsuarioEnBD(authData.user.id, email);

      if (!usuarioVerificado) {
        console.error('[SignUp] ✗ Usuario no encontrado en BD después de INSERT');

        console.log('[SignUp] Limpiando usuario huérfano en auth.users...');
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log('[SignUp] Usuario huérfano eliminado de auth.users');
        } catch (cleanupError) {
          console.error('[SignUp] Error al limpiar usuario huérfano:', cleanupError);
        }

        throw new Error('No se pudo verificar la creación del usuario en la base de datos');
      }

      console.log('[SignUp] ✓ Usuario verificado en BD exitosamente');
    } catch (error) {
      console.error('[SignUp] ✗ FALLO en Paso 3 (verificación)');
      throw error;
    }

    if (role === 'client' && profileData.preferences) {
      try {
        console.log('[SignUp] Paso 4: Enviando webhook de registro...');
        await enviarWebhookRegistro(profileData.name, profileData.preferences);
        console.log('[SignUp] ✓ Webhook enviado exitosamente');
      } catch (error) {
        console.error('[SignUp] ⚠️ ADVERTENCIA: Error al enviar webhook (el registro continúa):', error);
      }
    }

    const endTime = new Date();
    const totalTime = endTime.getTime() - startTime.getTime();
    console.log('[SignUp] ========================================');
    console.log('[SignUp] ✓ REGISTRO COMPLETADO EXITOSAMENTE');
    console.log('[SignUp] ========================================');
    console.log('[SignUp] Resumen:', {
      email,
      authId: authData.user.id,
      rol: dbRole,
      tiempoTotal: `${totalTime}ms`,
      timestamp: endTime.toISOString(),
    });

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
