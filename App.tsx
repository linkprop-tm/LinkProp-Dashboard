
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Properties } from './components/Properties';
import { Interests } from './components/Interests';
import { Visited } from './components/Visited';
import { Settings } from './components/Settings';
import { AddPropertyModal } from './components/AddPropertyModal';
import { UnderConstruction } from './components/UnderConstruction';
import { Welcome } from './components/Welcome';
import { ClientLayout } from './components/ClientLayout';
import { MobileNavbar } from './components/MobileNavbar';

export type UserRole = 'agent' | 'client' | null;

const App: React.FC = () => {
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(null);

  // 1. Auth Flow
  if (!userRole) {
    return <Welcome onLogin={(role) => {
      setUserRole(role);
      setCurrentView('dashboard'); // Reset view on login
    }} />;
  }

  // 2. Client Flow (New Interface)
  if (userRole === 'client') {
    return <ClientLayout onLogout={() => setUserRole(null)} />;
  }

  // 3. Agent Flow (Existing Interface)
  const renderAgentContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'properties':
        return <Properties />;
      case 'clients':
        return <Clients />;
      case 'interests':
        return <Interests />;
      case 'visited':
        return <Visited />;
      case 'settings':
        return <Settings onLogout={() => setUserRole(null)} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Fixed (Desktop Only) - Updated to XL to support tablet mode */}
      <div className="hidden xl:block flex-shrink-0">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
        />
      </div>

      {/* Main Content Area - Single Scrollable Container */}
      {/* Header is now INSIDE this container so sticky + backdrop blur works as content scrolls under it */}
      <div className="flex-1 h-screen overflow-y-auto scroll-smooth relative">
         <div className="pb-24 xl:pb-0">
            <Header onAddProperty={() => setIsAddPropertyModalOpen(true)} />
            
            {renderAgentContent()}
            
            {/* Footer / Copyright */}
            <div className="p-8 text-center text-xs text-gray-400">
              &copy; 2025 LinkProp. All rights reserved. Designed for Top Agents.
            </div>
         </div>
      </div>

      {/* Mobile Bottom Navigation (Agent Only) - Visible on Mobile and Tablet (Hidden on XL+) */}
      <MobileNavbar currentView={currentView} onNavigate={setCurrentView} />

      {/* Modal Layer */}
      <AddPropertyModal 
        isOpen={isAddPropertyModalOpen} 
        onClose={() => setIsAddPropertyModalOpen(false)}
        initialData={null} 
      />
    </div>
  );
};

export default App;
