import React, { useState, useEffect } from 'react';
import {
  Sparkles, Check, ArrowRight, X, MapPin, ArrowDown, ArrowUp, Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import { AddPropertyModal } from './AddPropertyModal';
import { Property, Client } from '../types';
import { obtenerMatchesParaTodosLosUsuarios, UsuarioConMatches } from '../lib/api/matches';
import { transformUsuarioToClient, transformPropiedadToProperty, MatchData, transformMatchToUI } from '../lib/adapters-matching';

export const Matching: React.FC = () => {
  const [clientModalOpen, setClientModalOpen] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [matchesData, setMatchesData] = useState<UsuarioConMatches[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatchesData();
  }, []);

  const loadMatchesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerMatchesParaTodosLosUsuarios(70);
      setMatchesData(data);
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Error al cargar los datos de matching. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClientModal = (clientId: string) => {
     setClientModalOpen(clientId);
  };

  const renderClientView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Calculando matches...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadMatchesData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    if (matchesData.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p className="text-gray-600">Cuando agregues usuarios al sistema, aparecerán aquí con sus matches.</p>
          </div>
        </div>
      );
    }

    const sortedGroups = [...matchesData].sort((a, b) => {
      const countA = a.total_matches;
      const countB = b.total_matches;
      return sortOrder === 'desc' ? countB - countA : countA - countB;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {sortedGroups.map((usuarioData) => {
          const client = transformUsuarioToClient(usuarioData.usuario);
          const highMatches = usuarioData.matches_alta;
          const medMatches = usuarioData.matches_media;
          const lowMatches = usuarioData.matches_baja;
          const totalMatches = usuarioData.total_matches;

          const chartData = [
            { name: '+90% Match', value: highMatches, color: '#10b981' },
            { name: '+80% Match', value: medMatches, color: '#f59e0b' },
            { name: '+70% Match', value: lowMatches, color: '#f43f5e' },
          ].filter(d => d.value > 0);

          return (
            <div key={client.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col overflow-hidden group">

              <div className="p-7">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-5">
                      <div className="relative flex-shrink-0 w-16 h-16">
                         <img src={client.avatar} alt={client.name} className="w-full h-full rounded-full object-cover ring-4 ring-gray-50" />
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

                   <div className="text-right pl-4">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Presupuesto</p>
                      <div className="flex flex-col items-end">
                          <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                            {client.searchParams.maxPrice > 0 ? client.searchParams.maxPrice.toLocaleString() : 'N/D'}
                          </p>
                          <p className="text-xs font-bold text-gray-400 mt-0.5">{client.searchParams.currency}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="h-px bg-gray-50 mx-7"></div>

              <div className="px-7 py-6 flex items-center gap-8">

                 <div className="w-36 h-36 relative flex-shrink-0 flex items-center justify-center">
                      {chartData.length > 0 ? (
                        <>
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
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                             <span className="text-3xl font-bold text-gray-900 leading-none">{totalMatches}</span>
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Matches</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-gray-300 leading-none">0</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Matches</span>
                        </div>
                      )}
                 </div>

                 <div className="flex-1 space-y-4">

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

  const renderClientModal = () => {
    if (!clientModalOpen) return null;

    const usuarioData = matchesData.find(ud => ud.usuario.id === clientModalOpen);
    if (!usuarioData) return null;

    const client = transformUsuarioToClient(usuarioData.usuario);
    const matches = usuarioData.matches.map(transformMatchToUI);

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
         <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setClientModalOpen(null)}></div>

         <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">

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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white">
               {matches.length === 0 ? (
                 <div className="flex items-center justify-center min-h-[400px]">
                   <div className="text-center max-w-md">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Sparkles className="w-8 h-8 text-gray-400" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">Sin matches disponibles</h3>
                     <p className="text-gray-600">Este usuario no tiene propiedades que coincidan con sus preferencias actualmente.</p>
                   </div>
                 </div>
               ) : (
                 matches.map((match, index) => {

                  let colorStart = '#10b981';
                  let colorEnd = '#34d399';
                  let textColor = 'text-emerald-700';

                  if (match.score < 90) {
                     colorStart = '#f59e0b';
                     colorEnd = '#fbbf24';
                     textColor = 'text-amber-700';
                  }
                  if (match.score < 75) {
                     colorStart = '#f43f5e';
                     colorEnd = '#fb7185';
                     textColor = 'text-rose-700';
                  }

                  const criterios = match.reason.split(', ');
                  const tienePrecio = criterios.some(c => c.toLowerCase().includes('precio'));
                  const tieneUbicacion = criterios.some(c => c.toLowerCase().includes('ubicación') || c.toLowerCase().includes('ubicacion'));
                  const tieneAmenities = criterios.some(c => c.toLowerCase().includes('amenities'));

                  return (
                    <div key={match.id} className={`pb-12 ${index !== matches.length - 1 ? 'border-b border-gray-100 mb-12' : ''}`}>

                       <div className="flex flex-col xl:flex-row gap-8 items-stretch">

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

                          <div className="flex-1 flex flex-col gap-4">
                             <div className="font-bold text-gray-400 uppercase tracking-wider text-right xl:text-left pt-1 flex-shrink-0 text-sm">
                                ANÁLISIS DE COINCIDENCIA
                             </div>

                             <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 flex-shrink-0 flex-1 flex flex-col justify-center">
                                <div>
                                   <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-900 font-bold">Presupuesto</span>
                                      <span className={`font-bold flex items-center gap-1 ${tienePrecio ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {tienePrecio ? <><Check size={14}/> Dentro del rango</> : 'Fuera del rango'}
                                      </span>
                                   </div>
                                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${tienePrecio ? 'bg-emerald-500 w-full' : 'bg-gray-300 w-[30%]'}`}></div>
                                   </div>
                                </div>

                                <div>
                                   <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-900 font-bold">Ubicación (Barrio)</span>
                                      <span className={`font-bold flex items-center gap-1 ${tieneUbicacion ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {tieneUbicacion ? <><Check size={14}/> Zona coincidente</> : 'Zona diferente'}
                                      </span>
                                   </div>
                                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${tieneUbicacion ? 'bg-emerald-500 w-[95%]' : 'bg-gray-300 w-[30%]'}`}></div>
                                   </div>
                                </div>

                                <div>
                                   <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-700 font-medium">Amenities</span>
                                      <span className={`font-bold flex items-center gap-1 ${tieneAmenities ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {tieneAmenities ? 'Coinciden' : 'No especificado'}
                                      </span>
                                   </div>
                                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${tieneAmenities ? 'bg-emerald-500 w-[70%]' : 'bg-gray-300 w-[40%]'}`}></div>
                                   </div>
                                </div>
                             </div>

                             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 min-h-[160px] flex-1">

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
               })
               )}
            </div>

         </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-24">

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

      <div className="min-h-[500px]">
         {renderClientView()}
      </div>

      {renderClientModal()}

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
