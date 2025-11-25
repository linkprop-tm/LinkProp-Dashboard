
import React, { useState } from 'react';
import { 
  Sparkles, Check, ArrowRight, X, MapPin, ArrowDown, ArrowUp
} from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { CLIENTS_DATA, PROPERTIES_GRID_DATA } from '../constants';
import { AddPropertyModal } from './AddPropertyModal';
import { Property } from '../types';

// --- MOCK MATCHING LOGIC ---
const MATCHES = CLIENTS_DATA.flatMap(client => {
  const matchedProps = PROPERTIES_GRID_DATA
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 5) + 5);

  return matchedProps.map(prop => ({
    id: `${client.id}-${prop.id}`,
    client,
    property: prop,
    score: Math.floor(Math.random() * (99 - 70) + 70), 
    status: ['new', 'sent', 'viewed', 'liked'][Math.floor(Math.random() * 4)],
    reason: 'Ubicación y Precio'
  }));
}).sort((a, b) => b.score - a.score);

export const Matching: React.FC = () => {
  // State for the Client Modal
  const [clientModalOpen, setClientModalOpen] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // --- HELPER FOR MODAL ---
  const handleOpenClientModal = (clientId: string) => {
     setClientModalOpen(clientId);
  };

  // VIEW: CLIENT CENTRIC CARDS
  const renderClientView = () => {
    // Group matches by client
    const clientGroups = Object.values(MATCHES.reduce((acc, match) => {
      if (!acc[match.client.id]) acc[match.client.id] = { client: match.client, matches: [] };
      acc[match.client.id].matches.push(match);
      return acc;
    }, {} as Record<string, { client: typeof CLIENTS_DATA[0], matches: typeof MATCHES }>));

    // Sort Groups based on sortOrder (Count of matches)
    const sortedGroups = clientGroups.sort((a, b) => {
        const countA = a.matches.length;
        const countB = b.matches.length;
        return sortOrder === 'desc' ? countB - countA : countA - countB;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sortedGroups.map(({ client, matches }) => {
          
          // Calculate Distribution for Chart
          const highMatches = matches.filter(m => m.score >= 90).length;
          const medMatches = matches.filter(m => m.score >= 80 && m.score < 90).length;
          const lowMatches = matches.filter(m => m.score >= 70 && m.score < 80).length;

          const chartData = [
            { name: '+90% Match', value: highMatches, color: '#10b981' }, // emerald-500
            { name: '+80% Match', value: medMatches, color: '#f59e0b' }, // amber-500
            { name: '+70% Match', value: lowMatches, color: '#f43f5e' }, // rose-500
          ].filter(d => d.value > 0);

          return (
            <div key={client.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col overflow-hidden group">
              
              {/* Card Header & Budget */}
              <div className="p-7">
                <div className="flex justify-between items-start">
                   {/* Left: Client Info */}
                   <div className="flex items-center gap-5">
                      <div className="relative">
                         <img src={client.avatar} alt={client.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-50" />
                      </div>
                      <div>
                         <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1.5">{client.name}</h3>
                         <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                    {client.searchParams.type}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                    en {client.searchParams.location}
                                </span>
                             </div>
                         </div>
                      </div>
                   </div>

                   {/* Right: Budget Display */}
                   <div className="text-right pl-4">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Presupuesto</p>
                      <div className="flex flex-col items-end">
                          <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                            {client.searchParams.maxPrice.toLocaleString()}
                          </p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{client.searchParams.currency}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-50 mx-7"></div>

              {/* Stats Section */}
              <div className="px-7 py-6 flex items-center gap-8">
                 
                 {/* Chart */}
                 <div className="w-36 h-36 relative flex-shrink-0 flex items-center justify-center">
                      <PieChart width={144} height={144}>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={62}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-3xl font-bold text-gray-900 leading-none">{matches.length}</span>
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Matches</span>
                    </div>
                 </div>

                 {/* Legend / Breakdown */}
                 <div className="flex-1 space-y-4">
                    
                    {/* Row 90+ */}
                    <div className="flex items-center justify-between group/row cursor-default">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 rounded-full bg-emerald-100 group-hover/row:bg-emerald-500 transition-colors duration-300"></div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">+90% Coincidencia</p>
                             <p className="text-xs font-bold text-emerald-600">Muy Alta</p>
                          </div>
                       </div>
                       <span className="text-xl font-bold text-gray-900">{highMatches}</span>
                    </div>

                    {/* Row 80+ */}
                    <div className="flex items-center justify-between group/row cursor-default">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 rounded-full bg-amber-100 group-hover/row:bg-amber-500 transition-colors duration-300"></div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">+80% Coincidencia</p>
                             <p className="text-xs font-bold text-amber-600">Alta</p>
                          </div>
                       </div>
                       <span className="text-xl font-bold text-gray-900">{medMatches}</span>
                    </div>

                    {/* Row 70+ */}
                    <div className="flex items-center justify-between group/row cursor-default">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 rounded-full bg-rose-100 group-hover/row:bg-rose-500 transition-colors duration-300"></div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">+70% Coincidencia</p>
                             <p className="text-xs font-bold text-rose-600">Media</p>
                          </div>
                       </div>
                       <span className="text-xl font-bold text-gray-900">{lowMatches}</span>
                    </div>

                 </div>
              </div>

              {/* Footer Action */}
              <div className="p-7 pt-2 mt-auto">
                 <button 
                    onClick={() => handleOpenClientModal(client.id)}
                    className="w-full py-3.5 rounded-xl bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                 >
                    Ver Perfil y Matches
                    <ArrowRight size={14} />
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- RENDER MODAL CONTENT ---
  const renderClientModal = () => {
    if (!clientModalOpen) return null;
    
    const client = CLIENTS_DATA.find(c => c.id === clientModalOpen);
    if (!client) return null;

    const matches = MATCHES.filter(m => m.client.id === clientModalOpen);
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
         {/* Backdrop */}
         <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setClientModalOpen(null)}></div>
         
         {/* Modal Container */}
         <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
               <div className="flex items-center gap-4">
                  <div className="relative">
                     <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100" />
                     <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
                         <div className={`w-3 h-3 rounded-full border-2 border-white ${matches.some(m => m.score > 90) ? 'bg-emerald-500' : 'bg-primary-500'}`}></div>
                     </div>
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
                     <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                     {matches.length} Matches Encontrados
                  </div>
                  <button onClick={() => setClientModalOpen(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                     <X size={24} />
                  </button>
               </div>
            </div>

            {/* Single Scrollable List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
               {matches.map((match, index) => {
                  
                  let colorStart = '#10b981'; // emerald-500
                  let colorEnd = '#34d399';   // emerald-400
                  let textColor = 'text-emerald-700';

                  if (match.score < 90) {
                     colorStart = '#f59e0b'; // amber-500
                     colorEnd = '#fbbf24';   // amber-400
                     textColor = 'text-amber-700';
                  }
                  if (match.score < 75) {
                     colorStart = '#f43f5e'; // rose-500
                     colorEnd = '#fb7185';   // rose-400
                     textColor = 'text-rose-700';
                  }

                  return (
                    <div key={match.id} className={`pb-12 ${index !== matches.length - 1 ? 'border-b border-gray-100 mb-12' : ''}`}>
                       
                       <div className="flex flex-col xl:flex-row gap-8 items-stretch">
                          
                          {/* LEFT SIDE: PROPERTY - IMMERSIVE CARD STYLE */}
                          <div className="w-full xl:w-96 space-y-3 flex-shrink-0">
                             <div className="flex justify-between items-center px-1">
                                <span className="font-bold text-gray-900 text-lg">
                                   Propiedad
                                </span>
                             </div>

                             <div 
                                className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-200"
                                onClick={() => setEditingProperty(match.property)}
                             >
                                <img src={match.property.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                
                                <div className="absolute top-4 left-4">
                                     <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1.5 border border-white/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Disponible
                                     </span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                     <div className="text-3xl font-bold tracking-tight mb-1 shadow-sm">
                                        {match.property.currency} {match.property.price.toLocaleString()}
                                     </div>
                                     <h3 className="text-lg font-bold leading-tight mb-1 shadow-sm">{match.property.title}</h3>
                                     <p className="text-xs font-medium text-white/80 flex items-center gap-1 mb-4">
                                        <MapPin size={12} /> {match.property.address}, {match.property.neighborhood}
                                     </p>
                                     
                                     <div className="flex items-center justify-between border-t border-white/20 pt-3 mt-2">
                                        <div className="flex gap-3 text-xs font-bold text-white/90">
                                           <span>{match.property.totalArea} m²</span>
                                           <span>•</span>
                                           <span>{match.property.environments} Amb</span>
                                           <span>•</span>
                                           <span>{match.property.antiquity} años</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-all duration-300">
                                           <ArrowRight size={14} className="transition-transform duration-300 group-hover:-rotate-45" />
                                        </div>
                                     </div>
                                </div>
                             </div>
                          </div>

                          {/* RIGHT SIDE: ANALYSIS */}
                          <div className="flex-1 flex flex-col gap-4">
                             <div className="font-bold text-gray-400 uppercase tracking-wider text-right xl:text-left pt-1 flex-shrink-0 text-sm">
                                ANÁLISIS DE COINCIDENCIA
                             </div>

                             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 flex-shrink-0 flex-1 flex flex-col justify-center">
                                {/* Item 1 */}
                                <div>
                                   <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-900 font-bold">Presupuesto</span>
                                      <span className="text-emerald-600 font-bold flex items-center gap-1"><Check size={14}/> Dentro del rango</span>
                                   </div>
                                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                                   </div>
                                </div>

                                {/* Item 2 */}
                                <div>
                                   <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-900 font-bold">Ubicación (Barrio)</span>
                                      <span className="text-emerald-600 font-bold flex items-center gap-1"><Check size={14}/> Zona exacta</span>
                                   </div>
                                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 w-[95%] rounded-full"></div>
                                   </div>
                                </div>

                                {/* Item 3 */}
                                <div>
                                   <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-700 font-medium">Amenities</span>
                                      <span className="text-amber-600 font-bold flex items-center gap-1">Falta Cochera</span>
                                   </div>
                                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-500 w-[70%] rounded-full"></div>
                                   </div>
                                </div>
                             </div>

                             {/* MATCH SCORE CARD (TEXT ONLY VERSION) - COMPACT */}
                             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 min-h-[160px] flex-1">
                                
                                {/* Background Elements for Harmony */}
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-current to-transparent opacity-[0.03] rounded-bl-full -mr-10 -mt-10 transition-opacity group-hover:opacity-[0.05] ${textColor}`}></div>
                                <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-current to-transparent opacity-[0.03] rounded-tr-full -ml-8 -mb-8 transition-opacity group-hover:opacity-[0.05] ${textColor}`}></div>

                                <div className="relative z-10 flex flex-col items-center justify-center">
                                    <div className={`text-7xl font-black tracking-tighter leading-none ${textColor} flex items-start`}>
                                        {match.score}
                                        <span className="text-3xl mt-1.5 opacity-40 font-bold tracking-normal">%</span>
                                    </div>
                                    
                                    <div className="mt-2">
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                          PUNTUACIÓN GENERAL
                                       </span>
                                    </div>
                                </div>
                             </div>

                          </div>

                       </div>
                    </div>
                  );
               })}
            </div>

         </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-24">
      
      {/* Header & Toolbar - SYMMETRICAL LAYOUT */}
      <div className="flex flex-col gap-6">
         <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                  <Sparkles className="text-primary-600 fill-primary-600" /> Matching Inteligente
               </h1>
               <p className="text-gray-500 mt-2">
                  Analiza la compatibilidad entre tu cartera de clientes y propiedades.
               </p>
            </div>
            
            {/* Sorting Buttons */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl self-start md:self-auto">
               <button
                  onClick={() => setSortOrder('desc')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                     sortOrder === 'desc' 
                     ? 'bg-white text-gray-900 shadow-sm' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
               >
                  <ArrowUp size={16} /> Mas Matches
               </button>
               <button
                  onClick={() => setSortOrder('asc')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                     sortOrder === 'asc' 
                     ? 'bg-white text-gray-900 shadow-sm' 
                     : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
               >
                  <ArrowDown size={16} /> Menos Matches
               </button>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
         {renderClientView()}
      </div>

      {/* Client Modal */}
      {renderClientModal()}

      {/* Edit Property Modal - NEW */}
      {editingProperty && (
        <AddPropertyModal 
          isOpen={true} 
          onClose={() => setEditingProperty(null)}
          initialData={editingProperty}
        />
      )}

    </div>
  );
};
