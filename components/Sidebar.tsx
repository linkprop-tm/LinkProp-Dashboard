
import React from 'react';
import { LayoutDashboard, Building2, Users, Heart, Settings, LogOut, History } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
    },
    { 
      id: 'properties', 
      icon: Building2, 
      label: 'Propiedades',
      activeClass: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
    },
    { 
      id: 'clients', 
      icon: Users, 
      label: 'Clientes',
      activeClass: 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
    },
    { 
      id: 'interests', 
      icon: Heart, 
      label: 'Interés en visitar',
      activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
    },
    { 
      id: 'visited', 
      icon: History, 
      label: 'Visitadas',
      activeClass: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Configuración',
      activeClass: 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col justify-between flex-shrink-0 z-20">
      <div>
        <div className="p-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">LinkProp</span>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? item.activeClass
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <img
            src="https://picsum.photos/100/100?random=99"
            alt="Agent"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Roberto Díaz</p>
            <p className="text-xs text-gray-500 truncate">Agente Inmobiliario</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
