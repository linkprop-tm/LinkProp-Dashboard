import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface AdminProfile {
  full_name: string;
  foto_perfil_url: string | null;
}

export const useAdminProfile = () => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('usuarios')
          .select('full_name, foto_perfil_url')
          .eq('rol', 'admin')
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setAdminProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch admin profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  return {
    adminProfile,
    loading,
    error,
    adminName: adminProfile?.full_name || 'Karina Poblete',
    adminPhoto: adminProfile?.foto_perfil_url || 'https://i.pravatar.cc/100?img=47'
  };
};
