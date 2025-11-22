
import React, { useState } from 'react';
import { ArrowRight, Briefcase, User } from 'lucide-react';
import { UserRole } from '../App';

interface WelcomeProps {
  onLogin: (role: UserRole) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('agent');

  const agentData = {
    email: 'roberto.diaz@linkprop.com',
    name: 'Roberto Díaz',
    title: 'Agente Inmobiliario',
    avatar: 'https://picsum.photos/100/100?random=99'
  };

  const clientData = {
    email: 'ana.garcia@gmail.com',
    name: 'Ana García',
    title: 'Cliente / Comprador',
    avatar: 'https://picsum.photos/100/100?random=50'
  };

  const currentData = selectedRole === 'agent' ? agentData : clientData;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-100/40 blur-3xl"></div>
         <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/50 max-w-md w-full text-center animate-fade-in-up transition-all duration-300">
        
        {/* Role Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setSelectedRole('agent')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${selectedRole === 'agent' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Briefcase size={16} /> Agente
          </button>
          <button 
            onClick={() => setSelectedRole('client')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${selectedRole === 'client' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <User size={16} /> Cliente
          </button>
        </div>

        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6 shadow-lg shadow-primary-600/30 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          L
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">LinkProp</h1>
        <p className="text-gray-500 mb-8 text-lg">
          {selectedRole === 'agent' ? 'Dashboard para Profesionales.' : 'Encuentra tu lugar ideal.'}
        </p>

        {/* Profile Preview */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-primary-50/50 rounded-xl border border-primary-100 text-left">
           <img src={currentData.avatar} alt="User" className="w-12 h-12 rounded-full object-cover ring-2 ring-white" />
           <div>
             <p className="text-sm font-bold text-gray-900">{currentData.name}</p>
             <p className="text-xs text-gray-500">{currentData.title}</p>
           </div>
        </div>

        <div className="space-y-5">
          <div className="text-left space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={currentData.email}
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-default"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">Verificado</span>
              </div>
            </div>
          </div>
          <div className="text-left space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-wide">Contraseña</label>
            <input 
              type="password" 
              value="password123" 
              readOnly
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-default"
            />
          </div>
        </div>

        <button 
          onClick={() => onLogin(selectedRole)}
          className="w-full mt-10 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 transition-all active:scale-95 flex items-center justify-center gap-3 group"
        >
          Ingresar como {selectedRole === 'agent' ? 'Agente' : 'Cliente'}
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
        </button>
        
        <div className="mt-8 flex items-center justify-center gap-4 opacity-60">
           <span className="h-px w-12 bg-gray-300"></span>
           <p className="text-xs text-gray-400">Demo LinkProp v2.4</p>
           <span className="h-px w-12 bg-gray-300"></span>
        </div>
      </div>
    </div>
  );
};
