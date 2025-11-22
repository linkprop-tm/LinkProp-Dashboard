
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, X, Check, Heart, Building, TrendingUp, Clock } from 'lucide-react';
import { RECENT_ACTIVITY } from '../constants';

interface HeaderProps {
  onAddProperty: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddProperty }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'interest': return <Heart size={16} className="text-rose-600" />;
      case 'new_property': return <Building size={16} className="text-blue-600" />;
      case 'match': return <TrendingUp size={16} className="text-amber-600" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'interest': return 'bg-rose-100';
      case 'new_property': return 'bg-blue-100';
      case 'match': return 'bg-amber-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <header className="h-20 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
      
      {/* Search Bar - Moved to left, responsive width */}
      <div className="relative flex-1 max-w-lg mr-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar propiedades, clientes..."
          className="pl-10 pr-4 py-2.5 w-full rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-primary-200 focus:ring-2 focus:ring-primary-100 text-sm outline-none transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        
        {/* Notification Dropdown Wrapper */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2.5 transition-colors rounded-full hover:bg-gray-100 ${isNotificationsOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in origin-top-right">
               {/* Header */}
               <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
                  <h3 className="font-bold text-gray-900 text-sm">Notificaciones</h3>
                  <button className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider flex items-center gap-1">
                    <Check size={12} /> Marcar leídas
                  </button>
               </div>

               {/* List */}
               <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                  {RECENT_ACTIVITY.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {RECENT_ACTIVITY.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative">
                           <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(item.type)}`}>
                                 {getNotificationIcon(item.type)}
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm text-gray-900 leading-snug mb-1">{item.description}</p>
                                 <p className="text-xs text-gray-400 font-medium">{item.time}</p>
                              </div>
                              {/* Blue dot for unread state visualization (optional logic) */}
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                       No tienes notificaciones nuevas.
                    </div>
                  )}
               </div>

               {/* Footer */}
               <div className="p-3 bg-gray-50 text-center border-t border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                  <button className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wide">
                    Ver historial completo
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onAddProperty}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-primary-600/20 hover:shadow-primary-600/40 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="hidden md:inline">Agregar Propiedad</span>
        </button>
      </div>
    </header>
  );
};
