
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, X, Check, Heart, Building, TrendingUp, Clock, Command } from 'lucide-react';
import { RECENT_ACTIVITY } from '../constants';
import { AgentOnly } from '../lib/components/RoleGuard';

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
    <header className="h-24 px-6 md:px-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between sticky top-0 z-30 transition-all duration-300">
      
      {/* Modern Search Bar */}
      <div className="relative flex-1 max-w-2xl mr-8 hidden md:block group z-20">
         {/* Decorative Glow Effect on Focus */}
         <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10 scale-95 group-focus-within:scale-110"></div>
         
         <div className="relative flex items-center">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300" size={20} strokeWidth={2.5} />
            
            <input
              type="text"
              placeholder="Buscar propiedades, clientes, direcciones..."
              className="w-full pl-14 pr-16 py-3.5 bg-gray-100/50 hover:bg-gray-100 border border-transparent focus:bg-white focus:border-primary-100 focus:ring-4 focus:ring-primary-50/60 rounded-full text-sm font-medium text-gray-800 placeholder:text-gray-400 transition-all duration-300 outline-none shadow-sm group-focus-within:shadow-xl group-focus-within:shadow-primary-900/5"
            />
            
            {/* Keyboard Shortcut Hint (Visual) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 group-focus-within:opacity-100 transition-opacity duration-300">
               <div className="hidden lg:flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 shadow-sm">
                 <span className="text-[10px] font-bold text-gray-400 group-focus-within:text-primary-600">⌘ K</span>
               </div>
            </div>
         </div>
      </div>
      
      {/* Mobile Search Icon (visible only on small screens) */}
      <button className="md:hidden p-3 text-gray-400 hover:bg-gray-50 rounded-full mr-auto">
        <Search size={24} />
      </button>

      <div className="flex items-center gap-4 md:gap-6 shrink-0">
        
        {/* Notification Dropdown Wrapper */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-3 transition-all rounded-full hover:bg-gray-50 group ${isNotificationsOpen ? 'bg-gray-50 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Bell size={22} className="group-hover:scale-110 transition-transform duration-200" strokeWidth={2}/>
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/20"></span>
          </button>

          {/* Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-6 w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-fade-in origin-top-right ring-1 ring-gray-900/5">
               {/* Header */}
               <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-gray-900 text-base">Notificaciones</h3>
                  <button className="text-[11px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider flex items-center gap-1 px-2 py-1 hover:bg-primary-50 rounded-lg transition-colors">
                    <Check size={14} /> Marcar leídas
                  </button>
               </div>

               {/* List */}
               <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-gray-50/30">
                  {RECENT_ACTIVITY.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {RECENT_ACTIVITY.map((item) => (
                        <div key={item.id} className="p-5 hover:bg-white transition-colors cursor-pointer group relative">
                           <div className="flex gap-4">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${getNotificationColor(item.type)}`}>
                                 {getNotificationIcon(item.type)}
                              </div>
                              <div className="flex-1">
                                 <p className="text-sm font-medium text-gray-900 leading-snug mb-1.5 group-hover:text-primary-600 transition-colors">{item.description}</p>
                                 <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <Clock size={10} /> {item.time}
                                 </p>
                              </div>
                              {/* Blue dot for unread state visualization */}
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 ring-4 ring-primary-50"></div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                          <Bell size={24} />
                       </div>
                       <p className="text-gray-500 text-sm font-medium">No tienes notificaciones nuevas.</p>
                    </div>
                  )}
               </div>

               {/* Footer */}
               <div className="p-4 bg-white text-center border-t border-gray-50">
                  <button className="text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wide px-4 py-2 hover:bg-gray-50 rounded-lg transition-all">
                    Ver historial completo
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* CTA - Solo para agentes */}
        <AgentOnly>
          <button
            onClick={onAddProperty}
            className="flex items-center gap-2.5 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-full text-sm font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 transition-all active:scale-95"
          >
            <div className="bg-white/20 rounded-full p-0.5">
              <Plus size={16} strokeWidth={3} />
            </div>
            <span className="hidden md:inline">Agregar Propiedad</span>
          </button>
        </AgentOnly>
      </div>
    </header>
  );
};
