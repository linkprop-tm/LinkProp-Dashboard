
import React from 'react';
import { LayoutDashboard, Building2, Users, Heart, Settings, History, Zap } from 'lucide-react';

interface MobileNavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'properties', icon: Building2, label: 'Prop.' },
    { id: 'clients', icon: Users, label: 'Clientes' },
    { id: 'matching', icon: Zap, label: 'Match' },
    { id: 'interests', icon: Heart, label: 'Interés' },
    { id: 'visited', icon: History, label: 'Visitas' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between md:justify-around items-center h-16 px-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-w-[48px] flex-1 h-full space-y-1 transition-colors duration-200 ${
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50' : ''}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
