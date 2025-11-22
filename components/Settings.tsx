
import React from 'react';
import { User, Mail, Phone, Camera, Save, LogOut, Shield, Key, ChevronRight } from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-500 mt-2">Gestiona tu información personal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Column 1: Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-10 relative overflow-hidden max-w-md w-full">
            
            {/* Decorative top gradient (optional subtle touch) */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-blue-400"></div>

            {/* Avatar Section */}
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-[5px] border-white shadow-xl ring-1 ring-gray-100">
                   <img 
                     src="https://picsum.photos/200/200?random=99" 
                     alt="Profile" 
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                   />
                </div>
                <button className="absolute bottom-1 right-1 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md border-[3px] border-white active:scale-95">
                  <Camera size={18} />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
               
               {/* Name Field */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                 <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="text" 
                      defaultValue="Roberto Díaz" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                 </div>
               </div>

               {/* Email Field */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
                 <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="email" 
                      defaultValue="roberto.diaz@linkprop.com" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                 </div>
               </div>

               {/* Phone Field */}
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Teléfono</label>
                 <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="tel" 
                      defaultValue="+54 9 11 1234 5678" 
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    />
                 </div>
               </div>

            </div>

            {/* Save Button */}
            <button className="w-full mt-10 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-4 rounded-2xl shadow-lg shadow-gray-900/20 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3">
               <Save size={20} />
               Guardar Perfil
            </button>

        </div>

        {/* Column 2: Logout / Security Section */}
        <div className="space-y-6 max-w-md w-full">
             <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                          <Shield size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">Seguridad</h3>
                          <p className="text-xs text-gray-500">Opciones de cuenta</p>
                      </div>
                  </div>

                  <button className="w-full flex items-center justify-between px-4 py-3 mb-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm border border-transparent hover:border-gray-100 group">
                      <div className="flex items-center gap-3">
                          <Key size={18} className="text-gray-400 group-hover:text-gray-600" />
                          Cambiar Contraseña
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500" />
                  </button>

                  <div className="h-px bg-gray-100 my-2"></div>

                  <button 
                     onClick={onLogout}
                     className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-transparent hover:border-red-200 transition-all font-bold text-sm mt-4 group"
                  >
                     <div className="flex items-center gap-3">
                        <LogOut size={18} /> Cerrar Sesión
                     </div>
                     <ChevronRight size={16} className="text-red-300 group-hover:text-red-500" />
                  </button>
             </div>
        </div>

      </div>
    </div>
  );
};
