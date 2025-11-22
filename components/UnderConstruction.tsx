import React from 'react';
import { Construction, ArrowRight } from 'lucide-react';

interface UnderConstructionProps {
  title: string;
  onBackToDashboard: () => void;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({ title, onBackToDashboard }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6 relative">
        <Construction size={48} strokeWidth={1.5} />
        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-sm">
           <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Estamos construyendo una experiencia increíble para esta sección. 
        Pronto podrás acceder a todas las funcionalidades avanzadas de LinkProp aquí.
      </p>

      <div className="flex gap-4">
        <button 
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-gray-600 font-medium hover:text-primary-600 transition-colors"
        >
          Volver al Dashboard
        </button>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-primary-600/20 transition-all active:scale-95 flex items-center gap-2">
          Notificarme cuando esté listo
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};