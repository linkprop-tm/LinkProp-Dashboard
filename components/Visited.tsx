
import React, { useState } from 'react';
import { 
  LayoutList, Users, Quote, Star, MapPin, Calendar, CheckCircle2
} from 'lucide-react';
import { PROPERTIES_GRID_DATA, CLIENTS_DATA } from '../constants';

// Mock Data for Visited Properties
const VISITS_MOCK = [
  { id: 'v1', clientId: '1', propertyId: '101', date: '15 Ene 2024', time: '14:30', rating: 4, comment: 'Me gustó mucho la luz del living. La cocina es un poco chica pero el precio está bien.', status: 'completed' },
  { id: 'v2', clientId: '2', propertyId: '101', date: '14 Ene 2024', time: '10:00', rating: 5, comment: 'Es exactamente lo que buscaba. Quiero hacer una oferta.', status: 'offer_made' },
  { id: 'v3', clientId: '3', propertyId: '102', date: '12 Ene 2024', time: '16:00', rating: 3, comment: 'El edificio es muy lindo pero las expensas son demasiado altas para mi presupuesto.', status: 'completed' },
  { id: 'v4', clientId: '4', propertyId: '103', date: '10 Ene 2024', time: '11:30', rating: 2, comment: 'Hay mucha humedad en la pared del dormitorio. Necesita muchos arreglos.', status: 'completed' },
  { id: 'v5', clientId: '1', propertyId: '106', date: '05 Ene 2024', time: '09:00', rating: 4, comment: 'Buena ubicación. Lo voy a tener en cuenta.', status: 'completed' },
  { id: 'v6', clientId: '5', propertyId: '102', date: '04 Ene 2024', time: '15:15', rating: 5, comment: 'Increíble vista. Me encanta.', status: 'interested' },
];

type ViewMode = 'timeline' | 'by_client';

export const Visited: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  // Helper to get data
  const getProp = (id: string) => PROPERTIES_GRID_DATA.find(p => p.id === id);
  const getClient = (id: string) => CLIENTS_DATA.find(c => c.id === id);

  const visits = VISITS_MOCK;

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          size={14} 
          className={`${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
        />
      ))}
    </div>
  );

  const ViewToggle = () => (
    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
       <button 
         onClick={() => setViewMode('timeline')}
         className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
            viewMode === 'timeline' 
            ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200' 
            : 'text-gray-500 hover:text-gray-900'
         }`}
       >
         <LayoutList size={16} /> Timeline
       </button>
       <button 
         onClick={() => setViewMode('by_client')}
         className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${
            viewMode === 'by_client' 
            ? 'bg-white text-primary-700 shadow-sm ring-1 ring-gray-200' 
            : 'text-gray-500 hover:text-gray-900'
         }`}
       >
         <Users size={16} /> Por Cliente
       </button>
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Propiedades Visitadas</h1>
          <p className="text-gray-500 mt-2">Historial de visitas y feedback detallado de tus clientes.</p>
        </div>
        <ViewToggle />
      </div>

      {/* ================= VIEW 1: TIMELINE ================= */}
      {viewMode === 'timeline' && (
        <div className="relative pl-4 space-y-12">
           {/* Timeline Track */}
           <div className="absolute left-[19px] top-4 bottom-10 w-px bg-gray-200/70"></div>

           {visits.map((visit) => {
             const prop = getProp(visit.propertyId);
             const client = getClient(visit.clientId);
             if (!prop || !client) return null;

             return (
               <div key={visit.id} className="relative pl-10 group">
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[10px] top-[52px] w-5 h-5 rounded-full bg-white border-[3px] border-primary-500 z-10 shadow-sm group-hover:scale-110 transition-transform duration-300"></div>
                  
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <Calendar size={12} className="text-gray-400"/> {visit.date}
                     </span>
                  </div>

                  {/* Card Container - Symmetrical Grid Layout */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-0 overflow-hidden">
                     <div className="grid grid-cols-1 lg:grid-cols-12">
                        
                        {/* Left: Property (Cols 1-4) */}
                        <div className="lg:col-span-4 p-5 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-gray-50 bg-white">
                           <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-inner group/img">
                              <img src={prop.imageUrl} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" alt="" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">
                                    {prop.operationType || 'Venta'}
                                 </span>
                              </div>
                              <h4 className="font-bold text-gray-900 text-sm truncate leading-tight mb-1 group-hover:text-primary-600 transition-colors">
                                 {prop.title}
                              </h4>
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mb-2">
                                 <MapPin size={12} /> {prop.address}
                              </p>
                              <p className="text-sm font-bold text-gray-900">
                                 {prop.currency} {prop.price.toLocaleString()}
                              </p>
                           </div>
                        </div>

                        {/* Center: Feedback (Cols 5-9) */}
                        <div className="lg:col-span-5 p-6 flex flex-col justify-center relative bg-gray-50/30">
                           <Quote size={20} className="absolute top-4 left-4 text-gray-200 -scale-x-100" />
                           <p className="text-sm text-gray-600 italic text-center leading-relaxed px-4">
                              "{visit.comment}"
                           </p>
                           <Quote size={20} className="absolute bottom-4 right-4 text-gray-200" />
                        </div>

                        {/* Right: Client & Rating (Cols 10-12) */}
                        <div className="lg:col-span-3 p-5 flex flex-col items-center lg:items-end justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-50 bg-white">
                           <div className="flex items-center gap-3 lg:flex-row-reverse">
                              <img src={client.avatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50 shadow-sm" alt="" />
                              <div className="text-center lg:text-right">
                                 <p className="font-bold text-sm text-gray-900">{client.name}</p>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cliente</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                              <span className="text-sm font-bold text-amber-600">{visit.rating}.0</span>
                              {renderStars(visit.rating)}
                           </div>
                        </div>

                     </div>
                  </div>
               </div>
             )
           })}
        </div>
      )}

      {/* ================= VIEW 2: BY CLIENT ================= */}
      {viewMode === 'by_client' && (
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Array.from(new Set(visits.map(v => v.clientId))).map(clientId => {
               const client = getClient(clientId);
               const clientVisits = visits.filter(v => v.clientId === clientId);
               if (!client) return null;

               return (
                  <div key={clientId} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                     {/* Client Header */}
                     <div className="p-6 bg-white border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <img src={client.avatar} className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50" alt="" />
                           <div>
                              <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                 <CheckCircle2 size={12} className="text-green-500" /> Cliente Activo
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="block text-2xl font-bold text-gray-900">{clientVisits.length}</span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visitas</span>
                        </div>
                     </div>
                     
                     {/* Visits List */}
                     <div className="divide-y divide-gray-50 bg-gray-50/20">
                        {clientVisits.map(visit => {
                           const prop = getProp(visit.propertyId);
                           return (
                              <div key={visit.id} className="p-5 hover:bg-white transition-colors group">
                                 <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                       <img src={prop?.imageUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                       <div className="flex justify-between items-start">
                                          <div>
                                             <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{prop?.title}</h4>
                                             <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <MapPin size={10} /> {prop?.address}
                                             </p>
                                          </div>
                                          <div className="flex flex-col items-end gap-1">
                                             <span className="text-[10px] font-medium text-gray-400">{visit.date}</span>
                                             {renderStars(visit.rating)}
                                          </div>
                                       </div>
                                       <div className="relative pl-3 border-l-2 border-primary-200">
                                          <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-2">
                                             "{visit.comment}"
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </div>
               )
            })}
         </div>
      )}

    </div>
  );
};
