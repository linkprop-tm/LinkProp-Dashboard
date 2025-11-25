
import React, { useState } from 'react';
import { 
  MapPin, Star, ArrowRight, 
  Lock, ArrowUp, ArrowDown, Check, Loader2, Quote, Eye
} from 'lucide-react';
import { PROPERTIES_GRID_DATA } from '../constants';
import { Property } from '../types';
import { AddPropertyModal } from './AddPropertyModal';

// Enhanced Mock Data with Client info
const VISITS_MOCK_INITIAL = [
  { 
    id: 'v2', 
    propertyId: '102', 
    clientName: 'Ana García',
    clientAvatar: 'https://picsum.photos/50/50?random=20',
    date: '12 Ene', 
    isoDate: '2024-01-12',
    fullDate: '12 Enero 2024', 
    time: '16:00', 
    rating: 0, 
    comment: '', 
    privateNote: '',
    status: 'offer' 
  },
  { 
    id: 'v1', 
    propertyId: '101', 
    clientName: 'Carlos Ruiz',
    clientAvatar: 'https://picsum.photos/50/50?random=21',
    date: '15 Ene', 
    isoDate: '2024-01-15',
    fullDate: '15 Enero 2024', 
    time: '14:30', 
    rating: 0, 
    comment: '', 
    privateNote: '',
    status: 'liked' 
  },
  { 
    id: 'v5', 
    propertyId: '106', 
    clientName: 'María Gomez',
    clientAvatar: 'https://picsum.photos/50/50?random=22',
    date: '05 Ene', 
    isoDate: '2024-01-05',
    fullDate: '05 Enero 2024', 
    time: '15:15', 
    rating: 0, 
    comment: '', 
    privateNote: '',
    status: 'liked' 
  },
  { 
    id: 'v4', 
    propertyId: '104', 
    clientName: 'Jorge Pérez',
    clientAvatar: 'https://picsum.photos/50/50?random=23',
    date: '08 Ene', 
    isoDate: '2024-01-08',
    fullDate: '08 Enero 2024', 
    time: '09:00', 
    rating: 0, 
    comment: '', 
    privateNote: '',
    status: 'maybe' 
  },
  { 
    id: 'v3', 
    propertyId: '103', 
    clientName: 'Lucía Mendez',
    clientAvatar: 'https://picsum.photos/50/50?random=24',
    date: '10 Ene', 
    isoDate: '2024-01-10',
    fullDate: '10 Enero 2024', 
    time: '11:30', 
    rating: 0, 
    comment: '', 
    privateNote: '',
    status: 'discarded' 
  },
  { 
    id: 'v6', 
    propertyId: '108', 
    clientName: 'Miguel Torres',
    clientAvatar: 'https://picsum.photos/50/50?random=25',
    date: '02 Ene', 
    isoDate: '2024-01-02',
    fullDate: '02 Enero 2024', 
    time: '10:00', 
    rating: 0, 
    comment: '', 
    privateNote: '',
    status: 'discarded' 
  },
];

type SortOrder = 'desc' | 'asc';

interface VisitedProps {
  onPropertyClick?: (property: Property) => void;
}

export const Visited: React.FC<VisitedProps> = ({ onPropertyClick }) => {
  const isAgent = !onPropertyClick; // If onPropertyClick is missing, we assume it's the Agent interface
  
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [visits, setVisits] = useState(VISITS_MOCK_INITIAL);
  const [savingStatus, setSavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const getProp = (id: string) => PROPERTIES_GRID_DATA.find(p => p.id === id);

  // Agent: Private Note Handlers
  const handleChange = (visitId: string, value: string) => {
    setVisits(prevVisits => 
      prevVisits.map(v => v.id === visitId ? { ...v, privateNote: value } : v)
    );
    if (savingStatus[`${visitId}-privateNote`] === 'saved') {
       setSavingStatus(prev => ({ ...prev, [`${visitId}-privateNote`]: 'idle' }));
    }
  };

  const handleSave = (visitId: string) => {
      const key = `${visitId}-privateNote`;
      setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
      setTimeout(() => {
         setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
         setTimeout(() => {
            setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
         }, 2000);
      }, 800);
  };

  // Client: Comment Handlers
  const handleCommentChange = (visitId: string, value: string) => {
    setVisits(prevVisits => 
      prevVisits.map(v => v.id === visitId ? { ...v, comment: value } : v)
    );
    const key = `${visitId}-comment`;
    if (savingStatus[key] === 'saved') {
        setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
    }
  };

  const handleSaveComment = (visitId: string) => {
      const key = `${visitId}-comment`;
      setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
      setTimeout(() => {
         setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
         setTimeout(() => {
            setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
         }, 2000);
      }, 800);
  };

  // Client: Rating Handler
  const handleRatingChange = (visitId: string, rating: number) => {
    setVisits(prevVisits => 
      prevVisits.map(v => v.id === visitId ? { ...v, rating: rating } : v)
    );
    // Simulate auto-save
    const key = `${visitId}-rating`;
    setSavingStatus(prev => ({ ...prev, [key]: 'saving' }));
    setTimeout(() => {
        setSavingStatus(prev => ({ ...prev, [key]: 'saved' }));
        setTimeout(() => {
            setSavingStatus(prev => ({ ...prev, [key]: 'idle' }));
        }, 2000);
    }, 500);
  };

  const renderSaveButton = (visitId: string) => {
      const status = savingStatus[`${visitId}-privateNote`] || 'idle';
      
      return (
        <button 
          onClick={() => handleSave(visitId)}
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
            {status === 'saving' ? 'GUARDANDO' : status === 'saved' ? 'GUARDADO' : 'GUARDAR'}
        </button>
      );
  };

  const renderCommentSaveButton = (visitId: string) => {
    const status = savingStatus[`${visitId}-comment`] || 'idle';
    return (
      <button 
        onClick={() => handleSaveComment(visitId)}
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

  const sortedVisits = [...visits].sort((a, b) => {
    const dateA = new Date(a.isoDate).getTime();
    const dateB = new Date(b.isoDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // --- VIEW RENDERER ---

  // Timeline / List View
  const renderTimelineView = () => (
    <div className="max-w-[1600px] mx-auto space-y-6">
        {sortedVisits.map((visit) => {
          const prop = getProp(visit.propertyId);
          if (!prop) return null;
          return (
            <div key={visit.id} className="animate-fade-in-up">
                
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
                                                <img src={visit.clientAvatar} className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50" alt="Client"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">{visit.clientName}</p>
                                            </div>
                                        </>
                                      ) : (
                                        <>
                                            <div className="relative">
                                                <img src="https://picsum.photos/100/100?random=99" className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50" alt="Agent"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Roberto Díaz</p>
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
                                              if (!isAgent) handleRatingChange(visit.id, star);
                                            }}
                                            className={`transition-all duration-200 outline-none focus:outline-none ${!isAgent ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}`}
                                          >
                                            <Star 
                                              size={26} // Interactive size
                                              className={`transition-colors duration-200 outline-none focus:outline-none ${
                                                  star <= visit.rating 
                                                  ? 'fill-yellow-400 text-yellow-400' 
                                                  : 'fill-gray-100 text-gray-200'
                                              } ${!isAgent && star > visit.rating ? 'hover:text-yellow-200' : ''}`} 
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
                                                value={visit.comment}
                                                onChange={(e) => handleCommentChange(visit.id, e.target.value)}
                                                className="w-full bg-transparent border-none px-5 py-4 text-gray-700 font-medium text-base leading-relaxed outline-none resize-none placeholder:text-gray-400 min-h-[100px]"
                                                placeholder="Contanos qué opinás sobre la propiedad…"
                                             />

                                             {/* Footer with Save Button */}
                                             <div className="flex justify-end items-center px-4 pb-3 pt-1 border-t border-transparent group-focus-within/input:border-gray-50 transition-colors">
                                                 {renderCommentSaveButton(visit.id)}
                                             </div>
                                        </div>
                                    </div>
                                 ) : (
                                     <div className="relative pl-10">
                                         <div className="absolute top-0 left-0 text-gray-200">
                                            <Quote size={28} className="fill-current transform scale-x-[-1]" />
                                         </div>
                                         <p className="text-gray-600 font-medium text-base leading-relaxed">
                                            {visit.comment || <span className="text-gray-400 italic">Sin comentarios aún...</span>}
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
                                     {visit.privateNote && (
                                         <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                                     )}
                                 </div>
                                 
                                 {/* Content Area - Clean Slate */}
                                 <div className="flex-1 px-6 relative pb-2">
                                    <textarea 
                                      value={visit.privateNote}
                                      onChange={(e) => handleChange(visit.id, e.target.value)}
                                      placeholder="Escribe lo que quieras..."
                                      className="w-full h-full min-h-[140px] bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-transparent focus:border-primary-100 rounded-xl p-4 text-sm text-gray-600 font-medium leading-relaxed outline-none resize-none placeholder:text-gray-400 focus:ring-4 focus:ring-primary-50/20 transition-all duration-300"
                                    />
                                 </div>

                                 {/* Footer Actions - Clean Separation */}
                                 <div className="px-6 py-4 flex items-center justify-end mt-auto">
                                      {renderSaveButton(visit.id)}
                                 </div>
                             </div>
                        </div>
                    )}

                </div>
            </div>
          );
        })}
    </div>
  );

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

    </div>
  );
};
