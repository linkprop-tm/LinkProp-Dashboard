
import React, { useState } from 'react';
import { Calendar, Phone, Mail, MapPin, ArrowRight, Building2, Users, Check, CheckCircle2 } from 'lucide-react';
import { PROPERTIES_GRID_DATA, CLIENTS_DATA } from '../constants';

// Mocking the relationship data for visualization
const INTERESTS_MOCK = [
  { id: 'i1', clientId: '1', propertyId: '101', date: '2024-01-15', status: 'pending' },
  { id: 'i2', clientId: '3', propertyId: '101', date: '2024-01-14', status: 'contacted' },
  { id: 'i3', clientId: '2', propertyId: '102', date: '2024-01-12', status: 'visited' },
  { id: 'i4', clientId: '5', propertyId: '102', date: '2024-01-10', status: 'pending' },
  { id: 'i5', clientId: '4', propertyId: '103', date: '2024-01-09', status: 'pending' },
  { id: 'i6', clientId: '1', propertyId: '104', date: '2024-01-08', status: 'contacted' },
];

type ViewMode = 'property' | 'client';

export const Interests: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('property');
  const [markedAsVisited, setMarkedAsVisited] = useState<string[]>([]);
  
  // Helper to get data
  const getProp = (id: string) => PROPERTIES_GRID_DATA.find(p => p.id === id);
  const getClient = (id: string) => CLIENTS_DATA.find(c => c.id === id);

  const handleMarkVisited = (interestId: string) => {
     if (markedAsVisited.includes(interestId)) return;
     setMarkedAsVisited([...markedAsVisited, interestId]);
  };

  // Group Data Logic
  const groupedData = React.useMemo(() => {
    if (viewMode === 'property') {
      // Group by Property ID
      const groups: Record<string, typeof INTERESTS_MOCK> = {};
      INTERESTS_MOCK.forEach(item => {
        if (!groups[item.propertyId]) groups[item.propertyId] = [];
        groups[item.propertyId].push(item);
      });
      return groups;
    } else {
      // Group by Client ID
      const groups: Record<string, typeof INTERESTS_MOCK> = {};
      INTERESTS_MOCK.forEach(item => {
        if (!groups[item.clientId]) groups[item.clientId] = [];
        groups[item.clientId].push(item);
      });
      return groups;
    }
  }, [viewMode]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interés en Visitar</h1>
          <p className="text-gray-500 mt-2">
            {viewMode === 'property' 
              ? 'Gestiona los interesados agrupados por cada propiedad.' 
              : 'Organiza recorridos y visitas según las necesidades de cada cliente.'}
          </p>
        </div>

        {/* View Toggle */}
        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center self-start md:self-auto">
          <button
            onClick={() => setViewMode('property')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'property' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 size={16} />
            Por Propiedad
          </button>
          <button
            onClick={() => setViewMode('client')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'client' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users size={16} />
            Por Cliente
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-8">
        
        {/* ========================== VIEW MODE: PROPERTY ========================== */}
        {viewMode === 'property' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Object.keys(groupedData).map(propId => {
              const prop = getProp(propId);
              const interests = groupedData[propId];
              if (!prop) return null;

              return (
                <div key={propId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                  {/* Property Header */}
                  <div className="flex flex-col sm:flex-row border-b border-gray-100">
                    <div className="w-full sm:w-48 h-48 sm:h-auto relative">
                      <img src={prop.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      
                      {/* Updated Badges Container */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                          <div className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-gray-900 shadow-sm border border-gray-100">
                            {prop.operationType || 'Venta'}
                          </div>
                          
                          {prop.status === 'active' && (
                            <div className="bg-emerald-100/90 backdrop-blur text-emerald-700 text-xs font-bold px-2 py-1 rounded shadow-sm border border-emerald-200 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Disponible
                            </div>
                          )}
                          {prop.status === 'pending' && (
                            <div className="bg-amber-100/90 backdrop-blur text-amber-700 text-xs font-bold px-2 py-1 rounded shadow-sm border border-amber-200 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Reservada
                            </div>
                          )}
                          {prop.status === 'sold' && (
                             <div className="bg-red-100/90 backdrop-blur text-red-700 text-xs font-bold px-2 py-1 rounded shadow-sm border border-red-200">
                                Vendida
                             </div>
                          )}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mt-1 leading-tight">{prop.title}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {prop.address}, {prop.neighborhood}
                          </p>
                        </div>
                        <div className="text-right pl-4">
                          <div className="text-xl font-bold text-gray-900 whitespace-nowrap">{prop.currency} {prop.price.toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-6 text-sm border-t border-gray-100 pt-4">
                        <div className="flex flex-col">
                           <span className="text-gray-400 text-xs font-medium uppercase">Interesados</span>
                           <span className="font-bold text-gray-900 text-lg">{interests.length}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-gray-400 text-xs font-medium uppercase">Visitas Totales</span>
                           <span className="font-bold text-gray-900 text-lg">{prop.views || 12}</span>
                        </div>
                        <div className="ml-auto flex items-end">
                           <button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                             Ver ficha <ArrowRight size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interested Clients List */}
                  <div className="bg-gray-50/50 p-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 px-2">Clientes Interesados</h4>
                    <div className="space-y-2">
                      {interests.map((interest) => {
                        const client = getClient(interest.clientId);
                        const isVisited = markedAsVisited.includes(interest.id) || interest.status === 'visited';
                        
                        if (!client) return null;
                        return (
                          <div key={interest.id} className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between hover:border-primary-200 transition-colors group gap-3">
                            <div className="flex items-center gap-3">
                              <img src={client.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{client.name}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                  <span>Interés: {interest.date}</span>
                                  {!isVisited && (
                                      <span className={`w-2 h-2 rounded-full ${
                                        interest.status === 'contacted' ? 'bg-blue-400' : 'bg-yellow-400'
                                      }`}></span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:opacity-80 sm:group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                               
                               <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-sm transition-colors active:scale-95">
                                 <Phone size={14} /> WhatsApp
                               </button>

                               <button 
                                 onClick={() => handleMarkVisited(interest.id)}
                                 disabled={isVisited}
                                 className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold shadow-sm transition-all border ${
                                    isVisited 
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default' 
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600 active:scale-95'
                                 }`}
                               >
                                 {isVisited ? (
                                    <>
                                      <Check size={14} /> Visitada
                                    </>
                                 ) : (
                                    <>
                                      <CheckCircle2 size={14} /> Marcar como Visitada
                                    </>
                                 )}
                               </button>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================== VIEW MODE: CLIENT ========================== */}
        {viewMode === 'client' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Object.keys(groupedData).map(clientId => {
              const client = getClient(clientId);
              const clientInterests = groupedData[clientId];
              if (!client) return null;

              return (
                <div key={clientId} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col h-full">
                  {/* Client Header */}
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={client.avatar} className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-50" alt="" />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-gray-900">{client.name}</h3>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <button className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95">
                          <Phone size={16} /> WhatsApp
                       </button>
                     </div>
                  </div>

                  {/* Properties List */}
                  <div className="space-y-3 flex-1">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Propiedades de Interés ({clientInterests.length})</h4>
                     
                     {clientInterests.map(interest => {
                       const prop = getProp(interest.propertyId);
                       if (!prop) return null;
                       
                       const isVisited = markedAsVisited.includes(interest.id) || interest.status === 'visited';

                       return (
                         <div key={interest.id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md hover:border-primary-100 transition-all">
                            <img src={prop.imageUrl} className="w-16 h-16 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                               <h5 className="font-bold text-gray-900 truncate text-sm">{prop.title}</h5>
                               <p className="text-xs text-gray-500 mb-1.5 truncate">{prop.address}</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-gray-200 text-gray-700 rounded">
                                    {prop.currency} {prop.price.toLocaleString()}
                                  </span>
                               </div>
                            </div>
                            <div className="flex flex-col justify-center pl-2">
                               <button 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkVisited(interest.id);
                                 }}
                                 disabled={isVisited}
                                 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 whitespace-nowrap ${
                                    isVisited 
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                                 }`}
                               >
                                 {isVisited ? (
                                    <>
                                      <Check size={12} /> Visitada
                                    </>
                                 ) : (
                                    'Marcar Visitada'
                                 )}
                               </button>
                            </div>
                         </div>
                       )
                     })}
                  </div>
                  
                  {/* Footer Action REMOVED */}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
