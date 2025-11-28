
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Properties } from './components/Properties';
import { Interests } from './components/Interests';
import { Visited } from './components/Visited';
import { Settings } from './components/Settings';
import { Matching } from './components/Matching';
import { AddPropertyModal } from './components/AddPropertyModal';
import { UnderConstruction } from './components/UnderConstruction';
import { Welcome } from './components/Welcome';
import { ClientLayout } from './components/ClientLayout';
import { MobileNavbar } from './components/MobileNavbar';
import { AuthProvider, useAuthContext } from './lib/contexts/AuthContext';
import { ProtectedRoute } from './lib/components/ProtectedRoute';

export type UserRole = 'agent' | 'client' | null;

const AppContent: React.FC = () => {
  const { user, role, loading, signOut } = useAuthContext();
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // 1. Auth Flow
  if (!user || !role) {
    return <Welcome onLogin={() => {}} />;
  }

  // 2. Client Flow (New Interface)
  if (role === 'client') {
    return (
      <ProtectedRoute requiredRole="client">
        <ClientLayout onLogout={signOut} />
      </ProtectedRoute>
    );
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
      case 'matching':
        return <Matching />;
      case 'interests':
        return <Interests />;
      case 'visited':
        return <Visited />;
      case 'settings':
        return <Settings onLogout={signOut} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
        {/* Sidebar - Fixed (Desktop Only) - Updated to LG to support standard desktop/laptop mode */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
          />
        </div>

        {/* Main Content Area - Single Scrollable Container */}
        {/* Header is now INSIDE this container so sticky + backdrop blur works as content scrolls under it */}
        <div className="flex-1 h-screen overflow-y-auto scroll-smooth relative">
           <div className="pb-24 lg:pb-0">
              <Header onAddProperty={() => setIsAddPropertyModalOpen(true)} />

              {renderAgentContent()}

              {/* Footer / Copyright */}
              <div className="p-8 text-center text-xs text-gray-400">
                &copy; 2025 LinkProp. Todos los derechos reservados.
              </div>
           </div>
        </div>

        {/* Mobile Bottom Navigation (Agent Only) - Visible on Mobile and Tablet (Hidden on LG+) */}
        <MobileNavbar currentView={currentView} onNavigate={setCurrentView} />

        {/* Modal Layer - Conditionally Rendered to ensure clean state on open */}
        {isAddPropertyModalOpen && (
          <AddPropertyModal
            isOpen={true}
            onClose={() => setIsAddPropertyModalOpen(false)}
            initialData={null}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
