
import React, { useState } from 'react';
import { 
  Search,
  LayoutGrid, 
  List, 
  SlidersHorizontal,
  Pencil,
  Heart,
  GitCompareArrows,
  MapPin,
  Car,
  Ruler,
  Bed,
  Bath
} from 'lucide-react';
import { PROPERTIES_GRID_DATA } from '../constants';
import { AddPropertyModal } from './AddPropertyModal';
import { Property } from '../types';

export const Properties: React.FC = () => {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleEditClick = (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    setEditingProperty(prop);
  };

  const closeEditModal = () => {
    setEditingProperty(null);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'pending') {
       return (
          <span className="bg-amber-100/90 backdrop-blur-md text-amber-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-amber-200 flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
             Reservada
          </span>
       );
    }
    if (status === 'sold') {
       return (
          <span className="bg-red-100/90 backdrop-blur-md text-red-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-red-200">
             Vendida
          </span>
       );
    }
    // Default: active
    return (
       <span className="bg-emerald-100/90 backdrop-blur-md text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-emerald-200 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Disponible
       </span>
    );
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      
      {/* Header Section with Modern Search Pill */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Title (Hidden on mobile for cleaner look, visible on desktop) */}
        <div className="hidden md:block min-w-[200px]">
           <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
           <p className="text-gray-500 text-sm">Gestiona tu inventario ({PROPERTIES_GRID_DATA.length})</p>
        </div>

        {/* Centered Search Pill */}
        <div className="w-full max-w-2xl relative group z-20">
             <div className="absolute inset-0 bg-primary-100/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 rounded-full p-1.5 pl-5 flex items-center gap-3 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                <Search className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar por dirección, barrio o ciudad..." 
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm font-medium h-10"
                />
                <div className="h-6 w-px bg-gray-200"></div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors whitespace-nowrap">
                  <SlidersHorizontal size={16} /> 
                  <span>Filtros</span>
                </button>
             </div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 flex-shrink-0">
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
             title="Vista Cuadrícula"
           >
             <LayoutGrid size={18} />
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
             title="Vista Lista"
           >
             <List size={18} />
           </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PROPERTIES_GRID_DATA.map((prop) => {
             const hasGarage = prop.amenities?.some(a => a.toLowerCase().includes('cochera') || a.toLowerCase().includes('garage'));

             return (
              <div key={prop.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative">
                
                {/* Image Area */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={prop.imageUrl} 
                    alt={prop.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-3 left-3">
                    {getStatusBadge(prop.status)}
                  </div>
                  
                  {/* Admin Quick Stats Overlay (Top Right) */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                     <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-600 shadow-sm border border-gray-100 flex items-center gap-1">
                        <GitCompareArrows size={12} /> {prop.matchesCount}
                     </div>
                     <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-rose-600 shadow-sm border border-gray-100 flex items-center gap-1">
                        <Heart size={12} className="fill-rose-600" /> {prop.interestedClients}
                     </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900 tracking-tight">{prop.currency} {prop.price.toLocaleString()}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          prop.operationType === 'Alquiler' 
                              ? 'bg-orange-50 text-orange-600 border-orange-100' 
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                          {prop.operationType || 'Venta'}
                      </span>
                  </div>
                  
                  <h4 className="font-medium text-base text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors leading-snug">{prop.title}</h4>
                  
                  <p className="text-gray-500 text-sm flex items-center gap-1 line-clamp-1">
                      <MapPin size={16} className="flex-shrink-0" /> {prop.address}, {prop.neighborhood}
                  </p>

                  {/* Metrics Strip */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-gray-100 pt-3 mt-auto overflow-x-auto no-scrollbar">
                      <span className="flex items-center gap-1 whitespace-nowrap"><b className="text-gray-900">{prop.totalArea || prop.area}</b> m²</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                      <span className="flex items-center gap-1 whitespace-nowrap"><b className="text-gray-900">{prop.environments}</b> Amb</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                      <span className="flex items-center gap-1 whitespace-nowrap"><b className="text-gray-900">{prop.bedrooms || 1}</b> Dorm</span>
                      
                      {hasGarage && (
                        <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                            <span className="flex items-center gap-1 whitespace-nowrap" title="Cochera Incluida">
                              <Car size={14} className="text-gray-500" />
                            </span>
                        </>
                      )}
                  </div>
                </div>

                {/* Admin Action Button */}
                <button 
                  onClick={(e) => handleEditClick(e, prop)}
                  className="w-full py-4 bg-gray-50 text-gray-500 hover:bg-primary-50 hover:text-primary-600 border-t border-gray-100 font-bold text-sm uppercase tracking-wide transition-all duration-300 ease-out flex items-center justify-center gap-2"
                >
                  <Pencil size={16} />
                  Editar Propiedad
                </button>

              </div>
             );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {PROPERTIES_GRID_DATA.map((prop) => (
            <div 
               key={prop.id} 
               className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all p-4 flex flex-col sm:flex-row gap-6 group cursor-pointer relative overflow-hidden"
               onClick={(e) => handleEditClick(e, prop)}
            >
                {/* Image */}
                <div className="w-full sm:w-48 h-48 sm:h-32 rounded-lg overflow-hidden relative flex-shrink-0">
                    <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2">
                        {getStatusBadge(prop.status)}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate pr-4">{prop.title}</h3>
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                <MapPin size={14} /> {prop.address}, {prop.neighborhood}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="flex items-center justify-end gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    prop.operationType === 'Alquiler' 
                                        ? 'bg-orange-50 text-orange-600 border-orange-100' 
                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {prop.operationType || 'Venta'}
                                </span>
                                <div className="text-xl font-bold text-primary-600">{prop.currency} {prop.price.toLocaleString()}</div>
                            </div>
                            {prop.expenses > 0 && <div className="text-xs text-gray-400">+ ${prop.expenses} exp</div>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Ruler size={14} /> {prop.totalArea} m²
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Bed size={14} /> {prop.bedrooms || 1}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Bath size={14} /> {prop.bathrooms || 1}
                        </span>
                    </div>
                </div>

                {/* Actions / Stats */}
                <div className="flex flex-row sm:flex-col items-center sm:justify-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                    <div className="flex flex-col items-end gap-1 w-full">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Matches</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                             <GitCompareArrows size={14} className="text-gray-400" /> {prop.matchesCount} matches
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-rose-600">
                             <Heart size={14} className="fill-rose-600" /> {prop.interestedClients} intereses
                        </div>
                    </div>
                    <button className="w-full py-2 bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 mt-auto">
                        <Pencil size={14} /> <span className="sm:hidden xl:inline">Editar</span>
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal Instance */}
      <AddPropertyModal 
        isOpen={!!editingProperty} 
        onClose={closeEditModal}
        initialData={editingProperty}
      />

    </div>
  );
};
