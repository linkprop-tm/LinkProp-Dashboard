
import React, { useState, useMemo } from 'react';
import { 
  MapPin, Users, CheckCircle2, 
  ArrowRight, Clock,
  RotateCcw
} from 'lucide-react';
import { PROPERTIES_GRID_DATA, CLIENTS_DATA } from '../constants';
import { AddPropertyModal } from './AddPropertyModal';
import { Property } from '../types';

// Mocking the relationship data for visualization
const INTERESTS_MOCK = [
  { id: 'i1', clientId: '1', propertyId: '101', date: '2024-01-15', status: 'pending' },
  { id: 'i2', clientId: '3', propertyId: '101', date: '2024-01-14', status: 'contacted' },
  { id: 'i3', clientId: '2', propertyId: '102', date: '2024-01-12', status: 'visited' },
  { id: 'i4', clientId: '5', propertyId: '102', date: '2024-01-10', status: 'pending' },
  { id: 'i5', clientId: '4', propertyId: '103', date: '2024-01-09', status: 'pending' },
  { id: 'i6', clientId: '1', propertyId: '104', date: '2024-01-08', status: 'contacted' },
  { id: 'i7', clientId: '2', propertyId: '108', date: '2024-01-11', status: 'pending' },
];

export const Interests: React.FC = () => {
  const [markedAsVisited, setMarkedAsVisited] = useState<string[]>([]);
  
  // State for Property Edit Modal
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // State for Unmark Confirmation Modal
  const [showUnmarkModal, setShowUnmarkModal] = useState(false);
  const [interestToUnmark, setInterestToUnmark] = useState<string | null>(null);

  // Helper to get data
  const getProp = (id: string) => PROPERTIES_GRID_DATA.find(p => p.id === id);
  const getClient = (id: string) => CLIENTS_DATA.find(c => c.id === id);

  const handleToggleVisited = (interestId: string) => {
     if (markedAsVisited.includes(interestId)) {
       // If currently visited, ask for confirmation to unmark
       setInterestToUnmark(interestId);
       setShowUnmarkModal(true);
     } else {
       // If not visited, mark immediately
       setMarkedAsVisited([...markedAsVisited, interestId]);
     }
  };

  const confirmUnmark = () => {
      if (interestToUnmark) {
          setMarkedAsVisited(markedAsVisited.filter(id => id !== interestToUnmark));
          setShowUnmarkModal(false);
          setInterestToUnmark(null);
      }
  };

  const cancelUnmark = () => {
      setShowUnmarkModal(false);
      setInterestToUnmark(null);
  };

  // Group Data Logic (Always by Property now)
  const groupedData = useMemo(() => {
      const groups: Record<string, typeof INTERESTS_MOCK> = {};
      INTERESTS_MOCK.forEach(item => {
        if (!groups[item.propertyId]) groups[item.propertyId] = [];
        groups[item.propertyId].push(item);
      });
      return groups;
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active': return <span className="bg-emerald-100/90 backdrop-blur-md text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponible</span>;
        case 'pending': return <span className="bg-amber-100/90 backdrop-blur-md text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Reservada</span>;
        case 'sold': return <span className="bg-red-100/90 backdrop-blur-md text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-red-200 shadow-sm">Vendida</span>;
        default: return null;
    }
  };

  // Helper to format date nicely
  const formatDateVisual = (dateStr: string) => {
      // Assuming dateStr is YYYY-MM-DD
      const [year, month, day] = dateStr.split('-');
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const monthName = months[parseInt(month) - 1] || 'ENE';
      
      return { day, monthName, year };
  };

  // Unmark Confirmation Modal Component
  const UnmarkModal = () => {
    if (!showUnmarkModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={cancelUnmark}
        />
        
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-fade-in-up transform scale-100 origin-center">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4 ring-4 ring-amber-50/50">
                    <RotateCcw size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Deshacer visita?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                   Esta propiedad ya estaba marcada como visitada. Si confirmas, volverá al estado de "Interés pendiente".
                </p>

                <div className="flex gap-3 w-full">
                   <button 
                     onClick={cancelUnmark}
                     className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                   >
                      Cancelar
                   </button>
                   <button 
                     onClick={confirmUnmark}
                     className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black shadow-lg shadow-gray-900/20 transition-all active:scale-95"
                   >
                      Confirmar
                   </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-24">
      
      {/* Header & Main Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interés en Visitar</h1>
          <p className="text-gray-500 mt-2">
            Gestiona los interesados agrupados por cada propiedad.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-8 animate-fade-in">
        
        {/* ========================== VIEW MODE: PROPERTY (Default and Only) ========================== */}
        {Object.keys(groupedData).map(propId => {
            const prop = getProp(propId);
            const interests = groupedData[propId];
            if (!prop) return null;
            
            return (
              <div key={prop.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300 border border-gray-100 flex flex-col md:flex-row min-h-[280px] group/card">
                  
                  {/* Left Side: Image Section (35%) - Fusion Style */}
                  <div 
                    className="relative w-full md:w-[35%] h-56 md:h-auto overflow-hidden group/image cursor-pointer"
                    onClick={() => setEditingProperty(prop)}
                  >
                    <img src={prop.imageUrl} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90"></div>
                    
                    {/* Property Status Badge */}
                    <div className="absolute top-4 left-4">
                        {getStatusBadge(prop.status)}
                    </div>

                    {/* Interactive Arrow Button */}
                    <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 z-20 group-hover/image:bg-white group-hover/image:text-primary-600 group-hover/image:border-white group-hover/image:scale-110 shadow-sm">
                        <ArrowRight size={22} className="transition-transform duration-300 group-hover/image:-rotate-45" />
                    </button>

                    <div className="absolute bottom-6 left-6 right-6 text-white pr-20">
                          {/* Price */}
                          <div className="text-3xl font-bold mb-1 tracking-tight">{prop.currency} {prop.price.toLocaleString()}</div>
                          
                          {/* Title */}
                          <h3 className="text-lg font-medium leading-tight mb-2 truncate text-white/90">{prop.title}</h3>
                          
                          {/* Address */}
                          <p className="text-white/70 text-xs font-medium flex items-center gap-1">
                              <MapPin size={12}/> {prop.address}, {prop.neighborhood}
                          </p>
                    </div>
                  </div>

                  {/* Right Side: Content (65%) */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col bg-white relative">
                      
                      {/* Header Area */}
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                              <Users className="text-primary-600" size={20} />
                              <h4 className="font-bold text-gray-900 uppercase tracking-wide text-xs">
                                Clientes Interesados ({interests.length})
                              </h4>
                          </div>
                      </div>

                      {/* Client Grid */}
                      <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
                              {interests.map(interest => {
                                  const client = getClient(interest.clientId);
                                  if (!client) return null;
                                  const isVisited = markedAsVisited.includes(interest.id) || interest.status === 'visited';
                                  const dateInfo = formatDateVisual(interest.date);

                                  return (
                                      <div key={interest.id} className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-white hover:shadow-md transition-all group/client">
                                          
                                          {/* Client Info */}
                                          <div className="flex items-center gap-3 mb-4">
                                              <div className="relative flex-shrink-0">
                                                  <img src={client.avatar} className="w-10 h-10 rounded-full ring-2 ring-white object-cover" alt="" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                  <p className="text-sm font-bold text-gray-900 truncate">{client.name}</p>
                                                  <p className="text-xs text-gray-400 truncate">{client.email}</p>
                                              </div>
                                          </div>
                                          
                                          {/* Date Widget (Same format as Client View) */}
                                          <div className="flex items-center gap-3 mb-4 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                              <div className="bg-gray-50 border border-gray-100 rounded-lg p-1.5 min-w-[48px] flex flex-col items-center justify-center text-center">
                                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{dateInfo.monthName}</span>
                                                  <span className="text-lg font-bold text-gray-900 leading-none mt-0.5">{dateInfo.day}</span>
                                              </div>
                                              <div className="flex flex-col min-w-0">
                                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                                      <Clock size={10} /> Fecha interés
                                                  </span>
                                                  <span className="text-xs font-bold text-gray-700 leading-tight mt-0.5 truncate">
                                                      {dateInfo.day} de {dateInfo.monthName}, {dateInfo.year}
                                                  </span>
                                              </div>
                                          </div>
                                          
                                          {/* Action Button - Prominent & Stable */}
                                          <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleVisited(interest.id);
                                              }}
                                              className={`w-full h-10 rounded-xl text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 mt-auto border-2 ${
                                                  isVisited 
                                                  ? 'bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-50' 
                                                  : 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800'
                                              }`}
                                          >
                                              {isVisited ? <CheckCircle2 size={14} /> : null}
                                              {isVisited ? 'Visitada' : 'Marcar Visitada'}
                                          </button>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>

              </div>
            )
        })}
      </div>
      
      {/* Property Edit Modal - Conditionally Rendered */}
      {editingProperty && (
        <AddPropertyModal 
          isOpen={true} 
          onClose={() => setEditingProperty(null)}
          initialData={editingProperty}
        />
      )}

      {/* Render Unmark Modal */}
      <UnmarkModal />

    </div>
  );
};
