
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, LogOut, Shield, Key, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../lib/contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const { user } = useAuthContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('usuarios')
      .select('full_name, email, telefono')
      .eq('auth_id', user.id)
      .maybeSingle();

    if (data && !error) {
      setName(data.full_name || '');
      setEmail(data.email || user.email || '');
      setPhone(data.telefono || '');
    } else {
      setEmail(user.email || '');
    }
  };

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          full_name: name,
          telefono: phone,
        })
        .eq('auth_id', user?.id);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving user data:', error);
      setSaveError(error.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in pb-24">
      
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
            <p className="text-gray-500 mt-2 text-lg">Administra tu perfil, seguridad y preferencias de la cuenta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile Information (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10 relative overflow-hidden">
                {/* Decorative Background Blur */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="flex-shrink-0 mx-auto md:mx-0 text-center">
                        <div className="relative group inline-block">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white shadow-xl ring-1 ring-gray-100">
                                <img 
                                    src="https://picsum.photos/200/200?random=99" 
                                    alt="Profile" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            </div>
                            <button className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-all duration-200 shadow-md border-[3px] border-white active:scale-95">
                                <Camera size={16} />
                            </button>
                        </div>
                        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Foto de Perfil</p>
                    </div>

                    {/* Inputs Section */}
                    <div className="flex-1 w-full space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name Field */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                    <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre completo"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                    <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    disabled
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-gray-200 rounded-2xl text-gray-600 font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Teléfono</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                                    <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+54 9 11..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:ring-4 focus:ring-primary-50 focus:border-primary-200 outline-none transition-all"
                                    />
                                </div>
                            </div>
                         </div>

                        {/* Messages */}
                        {saveSuccess && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                            <Save size={16} className="text-emerald-600" />
                            <p className="text-sm text-emerald-800 font-medium">Cambios guardados correctamente</p>
                          </div>
                        )}
                        {saveError && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-600 mt-0.5" />
                            <p className="text-sm text-red-800">{saveError}</p>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-4 flex justify-end">
                            <button
                              onClick={handleSave}
                              disabled={loading}
                              className="bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-gray-900/20 active:scale-95 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Preferences & Security (Span 5) */}
        <div className="lg:col-span-5 space-y-6">

             {/* Card: Security */}
             <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                          <Shield size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">Seguridad</h3>
                          <p className="text-xs text-gray-500">Protege tu cuenta</p>
                      </div>
                  </div>

                  <button className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all text-gray-700 font-bold text-sm group">
                      <div className="flex items-center gap-3">
                          <Key size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                          Cambiar Contraseña
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                  </button>
             </div>

             {/* Card: Logout */}
             <button 
                onClick={onLogout}
                className="w-full bg-white border border-red-100 hover:border-red-200 hover:bg-red-50 p-6 rounded-[2rem] flex items-center justify-between group transition-all shadow-sm hover:shadow-md"
             >
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-white transition-colors">
                        <LogOut size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors">Cerrar Sesión</h3>
                        <p className="text-xs text-gray-500 group-hover:text-red-400">Finalizar tu sesión actual de forma segura</p>
                    </div>
                 </div>
                 <ChevronRight size={20} className="text-gray-300 group-hover:text-red-400 transition-colors" />
             </button>
        </div>

      </div>
    </div>
  );
};
