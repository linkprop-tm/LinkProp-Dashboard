import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
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
import { ClientLayout } from './components/ClientLayout';
import { MobileNavbar } from './components/MobileNavbar';
import { Login } from './components/Login';
import { Register } from './components/Register';

const App: React.FC = () => {
  const { user, userProfile, loading, isAdmin, isUser, signOut } = useAuth();
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    if (authView === 'login') {
      return <Login onSwitchToRegister={() => setAuthView('register')} />;
    }
    return <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  if (isUser) {
    return <ClientLayout onLogout={signOut} />;
  }

  if (isAdmin) {
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
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
          />
        </div>

        <div className="flex-1 h-screen overflow-y-auto scroll-smooth relative">
          <div className="pb-24 lg:pb-0">
            <Header onAddProperty={() => setIsAddPropertyModalOpen(true)} />

            {renderAgentContent()}

            <div className="p-8 text-center text-xs text-gray-400">
              &copy; 2025 LinkProp. All rights reserved. Designed for Top Agents.
            </div>
          </div>
        </div>

        <MobileNavbar currentView={currentView} onNavigate={setCurrentView} />

        {isAddPropertyModalOpen && (
          <AddPropertyModal
            isOpen={true}
            onClose={() => setIsAddPropertyModalOpen(false)}
            initialData={null}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Acceso no autorizado</h1>
        <p className="text-slate-600 mb-6">No tienes permisos para acceder a esta aplicación.</p>
        <button
          onClick={signOut}
          className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default App;
