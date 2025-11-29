
import React, { useState, useEffect } from 'react';
import {
  MapPin, Star, ArrowRight,
  Lock, ArrowUp, ArrowDown, Check, Loader2, Quote, Eye,
  RotateCcw, AlertTriangle
} from 'lucide-react';
import { Property } from '../types';
import { AddPropertyModal } from './AddPropertyModal';
import { obtenerVisitasPorPropiedad, cambiarEtapa, actualizarRelacion, agregarNotaAgente, type PropiedadConVisitantes } from '../lib/api/relationships';
import { propiedadToProperty } from '../lib/adapters';

type SortOrder = 'desc' | 'asc';

interface VisitedProps {
  onPropertyClick?: (property: Property) => void;
}

export const Visited: React.FC<VisitedProps> = ({ onPropertyClick }) => {
  const isAgent = !onPropertyClick;

  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [realVisits, setRealVisits] = useState<PropiedadConVisitantes[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [visitsError, setVisitsError] = useState('');
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [showUndoModal, setShowUndoModal] = useState(false);
  const [visitToUndo, setVisitToUndo] = useState<{propId: string, userId: string, relationId: string} | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [localComments, setLocalComments] = useState<Record<string, string>>({});
  const [localRatings, setLocalRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRealVisits();
  }, []);

  const fetchRealVisits = async () => {
    setLoadingVisits(true);
    setVisitsError('');
    try {
      const visits = await obtenerVisitasPorPropiedad();
      setRealVisits(visits);

      const notes: Record<string, string> = {};
      const comments: Record<string, string> = {};
      const ratings: Record<string, number> = {};

      visits.forEach(({ visitantes }) => {
        visitantes.forEach((v) => {
          notes[v.relacion_id] = v.nota_agente;
          comments[v.relacion_id] = v.comentario_compartido;
          if (v.calificacion !== null) {
            ratings[v.relacion_id] = v.calificacion;
          }
        });
      });

      setLocalNotes(notes);
      setLocalComments(comments);
      setLocalRatings(ratings);
    } catch (error) {
      console.error('Error fetching visits:', error);
      setVisitsError('Error al cargar las visitas');
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleChange = (relationId: string, value: string) => {
    setLocalNotes(prev => ({ ...prev, [relationId]: value }));
    if (savingStatus[`${relationId}-privateNote`] === 'saved') {
       setSavingStatus(prev => ({ ...prev, [`${relationId}-privateNote`]: 'idle' }));
    }
  };

  const handleSave = async (relationId: string, propId: string, userId: string) => {
      const key = `${relationId}-privateNote`;
      setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
      try {
        await agregarNotaAgente(propId, userId, localNotes[relationId] || '');
        setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
        setTimeout(() => {
           setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 2000);
      } catch (error) {
        console.error('Error saving note:', error);
        setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
      }
  };

  const handleUndoClick = (propId: string, userId: string, relationId: string) => {
      setVisitToUndo({ propId, userId, relationId });
      setShowUndoModal(true);
  };

  const confirmUndo = async () => {
      if (visitToUndo) {
          try {
            await cambiarEtapa(visitToUndo.propId, visitToUndo.userId, 'Interes');
            await fetchRealVisits();
            setShowUndoModal(false);
            setVisitToUndo(null);
          } catch (error) {
            console.error('Error undoing visit:', error);
          }
      }
  };

  const cancelUndo = () => {
      setShowUndoModal(false);
      setVisitToUndo(null);
  };

  const handleCommentChange = (relationId: string, value: string) => {
    setLocalComments(prev => ({ ...prev, [relationId]: value }));
    const key = `${relationId}-comment`;
    if (savingStatus[key] === 'saved') {
        setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
    }
  };

  const handleSaveComment = async (relationId: string) => {
      const key = `${relationId}-comment`;
      setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
      try {
        await actualizarRelacion({
          id: relationId,
          comentario_compartido: localComments[relationId] || ''
        });
        setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
        setTimeout(() => {
           setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 2000);
      } catch (error) {
        console.error('Error saving comment:', error);
        setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
      }
  };

  const handleRatingChange = async (relationId: string, rating: number) => {
    setLocalRatings(prev => ({ ...prev, [relationId]: rating }));
    const key = `${relationId}-rating`;
    setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
    try {
      await actualizarRelacion({
        id: relationId,
        calificacion: rating
      });
      setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
      setTimeout(() => {
          setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
      }, 2000);
    } catch (error) {
      console.error('Error saving rating:', error);
      setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
    }
  };

  const renderSaveButton = (relationId: string, propId: string, userId: string) => {
      const status = savingStatus[`${relationId}-privateNote`] || 'idle';
      
      return (
        <button
          onClick={() => handleSave(relationId, propId, userId)}
          disabled={status !== 'idle'}
          className={`
            px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm
            ${status === 'saved' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-white text-primary-600 border-gray-200 hover:border-primary-300 hover:shadow-md hover:text-primary-700'
            }
            ${status === 'saving' ? 'opacity-80 cursor-wait' : ''}
          `}
        >
            {status === 'saving' && <Loader2 size={12} className="animate-spin" />}
            {status === 'saved' && <Check size={12} strokeWidth={3} />}
            {status === 'saving' ? 'GUARDANDO' : status === 'saved' ? 'GUARDADO' : 'GUARDAR NOTA'}
        </button>
      );
  };

  const renderCommentSaveButton = (relationId: string) => {
    const status = savingStatus[`${relationId}-comment`] || 'idle';
    return (
      <button
        onClick={() => handleSaveComment(relationId)}
        disabled={status !== 'idle'}
        className={`
          text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all uppercase tracking-wide
          ${status === 'saved' 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
            : 'bg-white text-gray-500 hover:text-primary-600 hover:bg-primary-50 border border-gray-200 hover:border-primary-100 shadow-sm'}
        `}
      >
          {status === 'saving' && <Loader2 size={10} className="animate-spin" />}
          {status === 'saved' && <Check size={10} />}
          {status === 'saving' ? '...' : status === 'saved' ? 'Guardado' : 'Guardar'}
      </button>
    );
  };

  const getPropertyStatusBadge = (status: string) => {
    switch (status) {
        case 'active': return <span className="bg-emerald-100/90 backdrop-blur-md text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm">Disponible</span>;
        case 'pending': return <span className="bg-amber-100/90 backdrop-blur-md text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 shadow-sm">Reservada</span>;
        case 'sold': return <span className="bg-red-100/90 backdrop-blur-md text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-red-200 shadow-sm">Vendida</span>;
        default: return null;
    }
  };

  const formatDateVisual = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const day = date.getDate().toString().padStart(2, '0');
    const monthName = months[date.getMonth()];
    const year = date.getFullYear().toString();
    return { day, monthName, year };
  };

  const sortedVisits = [...realVisits].sort((a, b) => {
    const dateA = a.visitantes[0]?.fecha_visita ? new Date(a.visitantes[0].fecha_visita).getTime() : 0;
    const dateB = b.visitantes[0]?.fecha_visita ? new Date(b.visitantes[0].fecha_visita).getTime() : 0;
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // --- COMPONENT: UNDO MODAL ---
  const UndoVisitModal = () => {
    if (!showUndoModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={cancelUndo}
        />
        
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-fade-in-up transform scale-100 origin-center">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 ring-4 ring-red-50/50">
                    <AlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Deshacer visita?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                   La propiedad volverá a la lista de "Intereses en Visitar" como si nunca se hubiera concretado la visita.
                </p>

                <div className="flex gap-3 w-full">
                   <button 
                     onClick={cancelUndo}
                     className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                   >
                      Cancelar
                   </button>
                   <button 
                     onClick={confirmUndo}
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

  // --- VIEW RENDERER ---

  const renderTimelineView = () => {
    if (loadingVisits) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="animate-spin text-primary-600" />
            <p className="text-gray-500 font-medium">Cargando visitas...</p>
          </div>
        </div>
      );
    }

    if (visitsError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle size={48} className="text-red-500" />
            <p className="text-gray-900 font-bold text-lg">Error al cargar las visitas</p>
            <p className="text-gray-500">{visitsError}</p>
          </div>
        </div>
      );
    }

    if (sortedVisits.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Eye size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Aún no hay propiedades visitadas</h3>
            <p className="text-gray-500">
              Las propiedades marcadas como visitadas desde "Interés en Visitar" aparecerán aquí.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        {sortedVisits.map(({ propiedad, visitantes }) => {
          const prop = propiedadToProperty(propiedad);

          return visitantes.map((visitante) => {
            const dateInfo = formatDateVisual(visitante.fecha_visita);
            const avatarUrl = visitante.usuario.foto_perfil_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitante.usuario.full_name)}&background=6366f1&color=fff`;
            const rating = localRatings[visitante.relacion_id] ?? visitante.calificacion ?? 0;
            const comment = localComments[visitante.relacion_id] ?? visitante.comentario_compartido;
            const privateNote = localNotes[visitante.relacion_id] ?? visitante.nota_agente;

            return (
              <div key={visitante.relacion_id} className="animate-fade-in-up">
                
                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                    
                    {/* LEFT BLOCK: Property & Client Feedback (The "Public" context) */}
                    <div className="flex-1 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 flex flex-col md:flex-row group/card">
                        
                         {/* Image Section */}
                         <div 
                             onClick={() => {
                                 if (isAgent) {
                                     setEditingProperty(prop);
                                 } else {
                                     onPropertyClick?.(prop);
                                 }
                             }} 
                             className="relative w-full md:w-[40%] min-h-[280px] overflow-hidden group/image cursor-pointer"
                         >
                            <img src={prop.imageUrl} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
                            <div className="absolute top-4 left-4">{getPropertyStatusBadge(prop.status)}</div>
                            
                            {/* Interactive Arrow Button (Bottom Right) */}
                            <div className="absolute bottom-6 right-6 z-20">
                                <div className={`w-10 h-10 bg-black/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white group-hover/image:bg-white group-hover/image:text-primary-600 transition-all duration-300 shadow-sm group-hover/image:scale-110 ${isAgent ? 'w-12 h-12' : 'w-10 h-10'}`}>
                                      <ArrowRight size={18} className="transform group-hover/image:-rotate-45 transition-transform duration-300" />
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-6 right-20 text-white">
                                <div className="text-2xl font-bold mb-1 tracking-tight">{prop.currency} {prop.price.toLocaleString()}</div>
                                <h3 className="text-lg font-medium leading-tight mb-1 truncate text-white/90">{prop.title}</h3>
                                <p className="text-white/70 text-xs font-medium flex items-center gap-1"><MapPin size={12}/> {prop.address}</p>
                            </div>
                         </div>

                         {/* Client Feedback Section */}
                         <div className="flex-1 p-6 md:p-8 flex flex-col bg-white">
                              {/* Client Header */}
                              <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-3">
                                      {isAgent ? (
                                        <>
                                            <div className="relative">
                                                <img src={avatarUrl} className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50" alt="Client"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{visitante.usuario.full_name}</p>
                                            </div>
                                        </>
                                      ) : (
                                        <>
                                            <div className="relative">
                                                <img src="https://mhfdfnhjdfmescizbzol.supabase.co/storage/v1/render/image/public/avatars/dd5d766c-6eb9-497b-88da-2fe1dadde019/profile.png?width=400&height=400&quality=80" className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50" alt="Agent"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Karina Poblete</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Eye size={12} className="text-gray-400"/>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">puede ver tu comentario</p>
                                                </div>
                                            </div>
                                        </>
                                      )}
                                  </div>
                                  
                                  {/* Star Rating Display */}
                                  <div className="flex flex-col items-end">
                                      <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isAgent) handleRatingChange(visitante.relacion_id, star);
                                            }}
                                            className={`transition-all duration-200 outline-none focus:outline-none ${!isAgent ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}`}
                                          >
                                            <Star 
                                              size={26} // Interactive size
                                              className={`transition-colors duration-200 outline-none focus:outline-none ${
                                                  star <= rating
                                                  ? 'fill-yellow-400 text-yellow-400'
                                                  : 'fill-gray-100 text-gray-200'
                                              } ${!isAgent && star > rating ? 'hover:text-yellow-200' : ''}`} 
                                              strokeWidth={0} 
                                            />
                                          </button>
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-bold text-gray-400 mt-1.5 uppercase tracking-wider">Calificación</span>
                                  </div>
                              </div>

                              {/* Comment Box */}
                              <div className="flex-1 mt-2">
                                 
                                 {!isAgent ? (
                                    <div className="relative group/input">
                                        
                                        {/* Decorative Quote Mark - Modern Watermark Style */}
                                        <div className="absolute -top-3 -left-3 text-gray-100 transition-colors group-hover/input:text-gray-200 group-focus-within/input:text-primary-100 z-0 pointer-events-none">
                                            <Quote size={40} className="fill-current transform scale-x-[-1]" />
                                        </div>

                                        {/* The Input Card */}
                                        <div className="relative z-10 bg-gray-50/50 hover:bg-white focus-within:bg-white rounded-2xl border border-gray-100 focus-within:border-primary-200 focus-within:ring-4 focus-within:ring-primary-50/50 transition-all duration-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus-within:shadow-xl p-1">
                                             <textarea
                                                value={comment}
                                                onChange={(e) => handleCommentChange(visitante.relacion_id, e.target.value)}
                                                className="w-full bg-transparent border-none px-5 py-4 text-gray-700 font-medium text-base leading-relaxed outline-none resize-none placeholder:text-gray-400 min-h-[100px]"
                                                placeholder="Contanos qué opinás sobre la propiedad…"
                                             />

                                             {/* Footer with Save Button */}
                                             <div className="flex justify-end items-center px-4 pb-3 pt-1 border-t border-transparent group-focus-within/input:border-gray-50 transition-colors">
                                                 {renderCommentSaveButton(visitante.relacion_id)}
                                             </div>
                                        </div>
                                    </div>
                                 ) : (
                                     <div className="relative pl-10">
                                         <div className="absolute top-0 left-0 text-gray-200">
                                            <Quote size={28} className="fill-current transform scale-x-[-1]" />
                                         </div>
                                         <p className="text-gray-600 font-medium text-base leading-relaxed">
                                            {comment || <span className="text-gray-400 italic">Sin comentarios aún...</span>}
                                         </p>
                                     </div>
                                 )}
                              </div>
                         </div>
                    </div>

                    {/* RIGHT BLOCK: Private Note (The "Agent" context - Redesigned Modern Elegant) */}
                    {isAgent && (
                        <div className="w-full lg:w-[320px] xl:w-[350px] flex-shrink-0 flex flex-col">
                             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col relative group overflow-hidden">
                                 
                                 {/* Header */}
                                 <div className="px-6 py-5 flex items-center justify-between">
                                     <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                           <Lock size={14} strokeWidth={2.5}/>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900 transition-colors">Nota Privada</span>
                                     </div>
                                     {/* Visual indicator of note content */}
                                     {privateNote && (
                                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                                     )}
                                 </div>
                                 
                                 {/* Content Area - Clean Slate */}
                                 <div className="flex-1 px-6 relative pb-2">
                                    <textarea
                                      value={privateNote}
                                      onChange={(e) => handleChange(visitante.relacion_id, e.target.value)}
                                      placeholder="Escribe lo que quieras..."
                                      className="w-full h-full min-h-[140px] bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-transparent focus:border-primary-100 rounded-xl p-4 text-sm text-gray-600 font-medium leading-relaxed outline-none resize-none placeholder:text-gray-400 focus:ring-4 focus:ring-primary-50/20 transition-all duration-300"
                                    />
                                 </div>

                                 {/* Footer Actions - With Undo Button */}
                                 <div className="px-6 py-4 flex items-center justify-between mt-auto border-t border-gray-50 bg-gray-50/30">
                                      <button
                                        onClick={() => handleUndoClick(visitante.propiedad_id, visitante.usuario.id, visitante.relacion_id)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-red-100 text-red-600 shadow-sm hover:bg-red-50 hover:border-red-200 hover:shadow-md transition-all text-[10px] font-bold uppercase tracking-wider group"
                                      >
                                        <div className="p-1 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                                            <RotateCcw size={10} strokeWidth={2.5} />
                                        </div>
                                        Deshacer Visita
                                      </button>
                                      {renderSaveButton(visitante.relacion_id, visitante.propiedad_id, visitante.usuario.id)}
                                 </div>
                             </div>
                        </div>
                    )}

                </div>
            </div>
          );
        });
      })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-fade-in pb-32">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Propiedades Visitadas</h1>
          <p className="text-gray-500 text-sm md:text-lg max-w-2xl">
             Explora el historial de visitas. {isAgent ? 'Visualiza el feedback de tus clientes.' : 'Revisa tus notas y puntuaciones.'}
          </p>
        </div>

        {/* CONTROLS - Only Visible to Agent */}
        {isAgent && (
          <div className="flex flex-col sm:flex-row gap-4 self-start xl:self-auto items-center">
              
              {/* Sort Buttons (Common) */}
              <div className="bg-white shadow-sm border border-gray-100 p-1 rounded-xl flex gap-1">
                  <button
                      onClick={() => setSortOrder('desc')}
                      className={`p-2 rounded-lg transition-all ${sortOrder === 'desc' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Más Recientes"
                  >
                      <ArrowUp size={18} />
                  </button>
                  <button
                      onClick={() => setSortOrder('asc')}
                      className={`p-2 rounded-lg transition-all ${sortOrder === 'asc' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Más Antiguas"
                  >
                      <ArrowDown size={18} />
                  </button>
              </div>
          </div>
        )}
      </div>

      {/* CONTENT RENDERER */}
      <div className="min-h-[500px]">
         {renderTimelineView()}
      </div>

      {/* Edit Property Modal - Conditionally Rendered for Agent */}
      {isAgent && editingProperty && (
        <AddPropertyModal 
          isOpen={true} 
          onClose={() => setEditingProperty(null)}
          initialData={editingProperty}
        />
      )}

      {/* Undo Confirmation Modal */}
      <UndoVisitModal />

    </div>
  );
};