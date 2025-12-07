
import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Eye, EyeOff, LayoutGrid, List, Bed, Bath, Ruler, Edit2, Building2, Plus, RefreshCw
} from 'lucide-react';
import { AddPropertyModal } from './AddPropertyModal';
import { Property } from '../types';
import { useProperties } from '../lib/hooks/useProperties';
import { cambiarVisibilidadPropiedad } from '../lib/api/properties';
import { SkeletonGrid, SkeletonCard } from './SkeletonCard';
import { PROPERTIES_GRID_DATA } from '../constants';

// --- HELPER: Status Badge ---
const getStatusBadge = (status: string) => {
  if (status === 'pending') {
     return (
        <span className="bg-amber-100/90 backdrop-blur-md text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Reservada
        </span>
     );
  }
  if (status === 'sold') {
     return (
        <span className="bg-red-100/90 backdrop-blur-md text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-red-200 uppercase tracking-wider">
           Vendida
        </span>
     );
  }
  return (
     <span className="bg-emerald-100/90 backdrop-blur-md text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm border border-emerald-200 flex items-center gap-1.5 uppercase tracking-wider">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponible
     </span>
  );
};

// --- RENDERER: IMMERSIVE LANDSCAPE (GRID) ---
const RenderLandscape: React.FC<{ 
    prop: Property; 
    onEdit: (prop: Property) => void;
    onToggleVisibility: (id: string) => void; 
}> = ({ prop, onEdit, onToggleVisibility }) => {
  
  const isVisible = prop.isVisible;

  return (
    <div
        onClick={() => onEdit(prop)}
        className={`group relative aspect-video rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 bg-gray-900 animate-fade-in-up
            ${isVisible
                ? 'shadow-md hover:shadow-2xl'
                : 'shadow-inner border border-gray-200 opacity-90'
            }
        `}
    >
        {/* Image */}
        <img 
            src={prop.imageUrl} 
            className={`w-full h-full object-cover transition-all duration-700 
                ${isVisible 
                    ? 'grayscale-0 opacity-100 group-hover:scale-105' 
                    : 'grayscale opacity-50'
                }
            `} 
            alt={prop.title} 
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity
             ${isVisible ? 'opacity-80 group-hover:opacity-90' : 'opacity-70'}
        `}></div>
        
        {/* Top Section: Status Badge & Toggle Switch */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div>{getStatusBadge(prop.status)}</div>
            
            {/* Toggle Switch for Visibility */}
            <div 
                className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(prop.id);
                }}
            >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isVisible ? 'text-white' : 'text-gray-400'}`}>
                   {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </span>

                <button 
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none shadow-sm
                        ${isVisible ? 'bg-primary-600' : 'bg-gray-500'}
                    `}
                >
                    <div 
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out
                            ${isVisible ? 'translate-x-4' : 'translate-x-0'}
                        `}
                    />
                </button>
            </div>
        </div>

        {/* Bottom Section: Info */}
        <div className={`absolute bottom-0 left-0 right-0 p-5 text-white transform transition-all duration-300 ${isVisible ? 'translate-y-2 group-hover:translate-y-0 opacity-100' : 'translate-y-0 opacity-80'}`}>
            {/* Price Section */}
            <div className="text-2xl font-bold tracking-tight text-white shadow-black/50 drop-shadow-sm leading-none">
                {prop.currency} {prop.price.toLocaleString()}
            </div>
            
            {/* Info Row: Address & Type Badge */}
            <div className="flex justify-between items-center mt-1.5">
                <p className="text-white/80 text-xs font-bold flex items-center gap-1 tracking-wide truncate max-w-[55%]">
                    <MapPin size={12} className="flex-shrink-0"/> 
                    <span className="truncate">{prop.address}, {prop.neighborhood}</span>
                </p>

                {/* Property Type Badge */}
                <div className="flex gap-2 text-[10px] font-bold text-black bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg items-center">
                    <span>{prop.propertyType || 'Propiedad'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="uppercase text-primary-700">{prop.operationType || 'Venta'}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- RENDERER: LIST ROW ---
const RenderRow: React.FC<{ 
    prop: Property; 
    onEdit: (prop: Property) => void;
    onToggleVisibility: (id: string) => void; 
}> = ({ prop, onEdit, onToggleVisibility }) => {
    
    const isVisible = prop.isVisible;

    return (
        <div
            onClick={() => onEdit(prop)}
            className={`group bg-white p-3 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300 flex items-center gap-6 cursor-pointer animate-fade-in
                ${!isVisible ? 'opacity-70 bg-gray-50' : ''}
            `}
        >
            {/* Image Thumbnail */}
            <div className="relative w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                <img 
                    src={prop.imageUrl} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isVisible ? 'grayscale' : ''}`} 
                    alt={prop.title} 
                />
                <div className="absolute top-0 left-0">
                    {/* Tiny status indicator for list view */}
                    <div className={`w-3 h-3 rounded-br-lg ${
                        prop.status === 'active' ? 'bg-emerald-500' :
                        prop.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Title & Address (Span 4) */}
                <div className="md:col-span-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            {prop.propertyType || 'Propiedad'}
                        </span>
                        <span className="text-xs font-bold text-primary-600">{prop.operationType || 'Venta'}</span>
                    </div>
                    <h4 className={`font-bold text-gray-900 truncate ${!isVisible ? 'text-gray-500' : ''}`}>{prop.title}</h4>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {prop.address}, {prop.neighborhood}
                    </p>
                </div>

                {/* Price (Span 3) */}
                <div className="md:col-span-2">
                    <p className={`text-lg font-bold tracking-tight ${!isVisible ? 'text-gray-500' : 'text-gray-900'}`}>
                        {prop.currency} {prop.price.toLocaleString()}
                    </p>
                    {prop.expenses && (
                        <p className="text-[10px] text-gray-400 font-medium">+ ${prop.expenses.toLocaleString()} exp.</p>
                    )}
                </div>

                {/* Stats (Span 3) */}
                <div className="md:col-span-3 flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg min-w-[50px]">
                        <span className="text-gray-400 mb-0.5"><Ruler size={14} /></span>
                        <span className="text-xs font-bold text-gray-700">{prop.totalArea || prop.area} m²</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg min-w-[50px]">
                        <span className="text-gray-400 mb-0.5"><LayoutGrid size={14} /></span>
                        <span className="text-xs font-bold text-gray-700">{prop.environments}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-lg min-w-[50px]">
                        <span className="text-gray-400 mb-0.5"><Bed size={14} /></span>
                        <span className="text-xs font-bold text-gray-700">{prop.bedrooms}</span>
                    </div>
                </div>

                {/* Status & Actions (Span 3) */}
                <div className="md:col-span-3 flex items-center justify-end gap-4">
                     <div className="hidden lg:block">{getStatusBadge(prop.status)}</div>
                     
                     <div className="h-8 w-px bg-gray-100 hidden lg:block"></div>

                     {/* Visibility Toggle */}
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(prop.id);
                        }}
                        className={`p-2 rounded-lg transition-colors border ${
                            isVisible 
                            ? 'bg-white text-gray-400 hover:text-primary-600 border-gray-200 hover:border-primary-200' 
                            : 'bg-gray-100 text-gray-400 border-transparent'
                        }`}
                        title={isVisible ? 'Ocultar propiedad' : 'Hacer visible'}
                     >
                         {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                     </button>

                     {/* Edit Button */}
                     <button className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-100 transition-colors">
                        <Edit2 size={18} />
                     </button>
                </div>

            </div>
        </div>
    );
}

export const Properties: React.FC = () => {
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const { properties: dbProperties, loading, error, refetch } = useProperties();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (dbProperties.length > 0) {
      setProperties(dbProperties);
    } else if (!loading && dbProperties.length === 0) {
      setProperties(PROPERTIES_GRID_DATA);
    }
  }, [dbProperties, loading]);

  const handleEditClick = (prop: Property) => {
    setEditingProperty(prop);
  };

  const handleToggleVisibility = async (id: string) => {
      const property = properties.find(p => p.id === id);

      if (!property) return;

      const newVisibility = property.isVisible ? 'Privada' : 'Publica';

      setProperties(prevProps =>
          prevProps.map(p =>
              p.id === id ? { ...p, isVisible: !p.isVisible } : p
          )
      );

      try {
        await cambiarVisibilidadPropiedad(id, newVisibility);
        await refetch();
      } catch (err) {
        console.error('Error updating property visibility:', err);
        setProperties(prevProps =>
            prevProps.map(p =>
                p.id === id ? { ...p, isVisible: !p.isVisible } : p
            )
        );
      }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const syncSecret = prompt('Por favor ingresa el SYNC_SECRET_KEY configurado en Supabase:');

      if (!syncSecret) {
        setSyncing(false);
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/sync-properties-from-sheets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-secret': syncSecret,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSyncResult(result);
        await refetch();
      } else {
        setSyncResult({
          success: false,
          error: result.error || 'Error desconocido',
          details: result.details
        });
      }
    } catch (err) {
      console.error('Error syncing properties:', err);
      setSyncResult({
        success: false,
        error: 'Error de conexión',
        details: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setSyncing(false);
    }
  };

  const getFilteredProperties = () => {
     return properties.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
     );
  }

  if (loading) {
    return (
      <div className="p-8 max-w-[1920px] mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
              <p className="text-gray-500 mt-1">Gestiona la visibilidad y detalles de las propiedades.</p>
            </div>
          </div>
        </div>
        <SkeletonGrid items={9} variant="property" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-[1920px] mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1920px] mx-auto space-y-8 animate-fade-in pb-24">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
               <p className="text-gray-500 mt-1">Gestiona la visibilidad y detalles de las propiedades.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">

               {/* Sync Button */}
               <button
                 onClick={handleSync}
                 disabled={syncing}
                 className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm ${
                   syncing
                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md'
                 }`}
               >
                 <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                 {syncing ? 'Sincronizando...' : 'Sincronizar'}
               </button>

               {/* View Toggle */}
               <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                     <LayoutGrid size={18} strokeWidth={viewMode === 'grid' ? 2.5 : 2}/>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                     <List size={18} strokeWidth={viewMode === 'list' ? 2.5 : 2}/>
                  </button>
               </div>

               {/* Search Pill */}
               <div className="flex-1 md:w-80 relative group">
                  <div className="absolute inset-0 bg-primary-100/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white shadow-sm border border-gray-200 rounded-full p-2.5 pl-5 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300">
                      <Search className="text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Buscar por dirección, barrio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 text-sm h-full"
                      />
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Content Rendering based on ViewMode */}
      {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {getFilteredProperties().map((prop, idx) => (
                <RenderLandscape 
                    key={prop.id} 
                    prop={prop} 
                    onEdit={handleEditClick} 
                    onToggleVisibility={handleToggleVisibility}
                />
             ))}
          </div>
      ) : (
          <div className="flex flex-col gap-3">
             {/* Optional List Header */}
             <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-5">Propiedad</div>
                <div className="col-span-2">Precio</div>
                <div className="col-span-3">Características</div>
                <div className="col-span-2 text-right">Acciones</div>
             </div>

             {getFilteredProperties().map((prop, idx) => (
                <RenderRow 
                    key={prop.id} 
                    prop={prop} 
                    onEdit={handleEditClick} 
                    onToggleVisibility={handleToggleVisibility}
                />
             ))}
          </div>
      )}

      {/* Sync Result Modal */}
      {syncResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {syncResult.success ? '✓ Sincronización Exitosa' : '✗ Error en Sincronización'}
              </h2>
              <button
                onClick={() => setSyncResult(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>

            {syncResult.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <div className="text-emerald-600 font-bold text-2xl">{syncResult.stats.inserted}</div>
                    <div className="text-emerald-700 text-sm font-medium">Insertadas</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-blue-600 font-bold text-2xl">{syncResult.stats.updated}</div>
                    <div className="text-blue-700 text-sm font-medium">Actualizadas</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="text-amber-600 font-bold text-2xl">{syncResult.stats.skipped}</div>
                    <div className="text-amber-700 text-sm font-medium">Omitidas</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-red-600 font-bold text-2xl">{syncResult.stats.errors}</div>
                    <div className="text-red-700 text-sm font-medium">Errores</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    <strong>Total procesado:</strong> {syncResult.stats.processed} de {syncResult.stats.total_rows} filas
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Tiempo de ejecución:</strong> {syncResult.execution_time_ms}ms
                  </div>
                </div>

                {syncResult.errors && syncResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900">Detalles de errores:</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {syncResult.errors.map((err: any, idx: number) => (
                        <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                          <div className="text-red-700 font-medium">Fila {err.row}</div>
                          {err.id_original && <div className="text-red-600">ID: {err.id_original}</div>}
                          {err.field && <div className="text-red-600">Campo: {err.field}</div>}
                          <div className="text-red-600">{err.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-700 font-bold">{syncResult.error}</div>
                  {syncResult.details && (
                    <div className="text-red-600 text-sm mt-2">{syncResult.details}</div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSyncResult(null)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal - Conditionally Rendered to force remount and clean state init */}
      {editingProperty && (
        <AddPropertyModal
          isOpen={true}
          onClose={() => setEditingProperty(null)}
          initialData={editingProperty}
          onSuccess={() => {
            refetch();
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
};
