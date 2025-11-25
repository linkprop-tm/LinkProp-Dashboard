
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Briefcase, Star, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../App';

interface WelcomeProps {
  onLogin: (role: UserRole) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('agent');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* LEFT SIDE: Immersive Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
         {/* Main Background Image - REPLACED with placeholder for Agent Portrait */}
         {/* NOTE: Replace this URL with the local path to your uploaded image if needed */}
         <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2400&auto=format&fit=crop" 
            alt="Karina Poblete" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[20s] hover:scale-105"
         />
         
         {/* Gradient Overlay for Text Readability */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

         {/* Content Container */}
         <div className="relative z-10 flex flex-col justify-end w-full p-12 xl:p-20 h-full">
            
            {/* Main Text Area */}
            <div className="space-y-6 mb-10 xl:mb-20">
                {/* Floating Glass Card - Aesthetic Touch */}
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 text-white/90 text-sm font-medium mb-4 animate-fade-in-up">
                    <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border border-white" src="https://picsum.photos/50/50?random=1" alt=""/>
                        <img className="w-6 h-6 rounded-full border border-white" src="https://picsum.photos/50/50?random=2" alt=""/>
                        <img className="w-6 h-6 rounded-full border border-white" src="https://picsum.photos/50/50?random=3" alt=""/>
                    </div>
                    <span>+650 Clientes satisfechos</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                   Encontrá tu propiedad<br/>
                   <span className="text-white border-b-4 border-red-500 pb-2 inline-block">con Karina Poblete.</span>
                </h1>
            </div>
         </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
         
         <div className="w-full max-w-[420px] mx-auto animate-fade-in">
            
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
               <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Bienvenido</h2>
               <p className="text-gray-500 text-base">Ingresa tus datos para acceder al panel.</p>
            </div>

            {/* Role Selector (Subtle) */}
            <div className="flex p-1 bg-gray-50 rounded-xl mb-8 border border-gray-100">
               <button 
                  onClick={() => setSelectedRole('agent')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedRole === 'agent' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <Briefcase size={16} /> Agente
               </button>
               <button 
                  onClick={() => setSelectedRole('client')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedRole === 'client' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <User size={16} /> Cliente
               </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
               
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Correo Electrónico</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                     <input 
                        type="email" 
                        value={selectedRole === 'agent' ? 'roberto.diaz@linkprop.com' : 'ana.garcia@gmail.com'}
                        readOnly
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                     <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Contraseña</label>
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">¿Olvidaste tu contraseña?</button>
                  </div>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                     <input 
                        type={showPassword ? "text" : "password"} 
                        value="password123"
                        readOnly
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                     />
                     <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                     >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                  </div>
               </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-8">
               {/* Primary Button: Iniciar Sesión */}
               <button 
                  onClick={() => onLogin(selectedRole)}
                  className="group w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
               >
                  Iniciar Sesión
                  <ArrowRight size={20} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
               </button>

               {/* Secondary Button: Registrarse */}
               <button 
                  className="w-full bg-white text-blue-600 border-2 border-blue-50 hover:border-blue-100 hover:bg-blue-50/50 font-bold text-lg py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
               >
                  Registrarse
               </button>
            </div>

            {/* Terms */}
            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
               Al continuar, aceptas nuestros <span className="font-bold text-gray-600 cursor-pointer hover:underline">Términos de Servicio</span> y <span className="font-bold text-gray-600 cursor-pointer hover:underline">Política de Privacidad</span>.
            </p>

         </div>
      </div>
    </div>
  );
};
