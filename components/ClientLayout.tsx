
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LogOut, Search, Heart, MapPin, Home, Filter, ArrowRight, 
  Compass, History, GitCompare, Settings, HelpCircle, Menu,
  ChevronRight, Calendar, Check, X, PlusCircle, DollarSign, Ruler, LayoutGrid,
  Car, Briefcase, Bed, Bath, PenTool, Quote, StickyNote, Star,
  User, Mail, Phone, Camera, Save, Sparkles, Building, Minus, Plus,
  ArrowUpDown, ArrowDownUp, Layers, AlignLeft, Users, Lock,
  List, Image as ImageIcon, Table as TableIcon, Columns, MoreHorizontal, Send, CheckCircle2
} from 'lucide-react';
import { PROPERTIES_GRID_DATA } from '../constants';
import { PropertyDetails } from './PropertyDetails';
import { Property } from '../types';

interface ClientLayoutProps {
  onLogout: () => void;
}

type ClientView = 'explore' | 'interests' | 'visited' | 'compare' | 'settings' | 'help';
type SortOption = 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'neighborhood_group' | 'default';

export const ClientLayout: React.FC<ClientLayoutProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<ClientView>('explore');
  const [searchTerm, setSearchTerm] = useState('');
  // Expanded favorites list for demo purposes
  const [favorites, setFavorites] = useState<string[]>(['101', '102', '103', '104', '106', '108']);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Sort State
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  
  // Settings State
  const [settingsPropertyTypes, setSettingsPropertyTypes] = useState<string[]>(['Departamento']);
  const [settingsAmenities, setSettingsAmenities] = useState<string[]>([]);
  const [settingsAntiquity, setSettingsAntiquity] = useState<string[]>(['Hasta 5 años']);
  const [settingsOperation, setSettingsOperation] = useState('Venta');
  
  // Mock data for "Visitadas"
  const visitedIds = ['103', '108'];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fid => fid !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handlePropertyClick = (prop: Property) => {
    setSelectedProperty(prop);
  };

  const toggleSettingsPropertyType = (type: string) => {
    if (settingsPropertyTypes.includes(type)) {
        setSettingsPropertyTypes(settingsPropertyTypes.filter(t => t !== type));
    } else {
        setSettingsPropertyTypes([...settingsPropertyTypes, type]);
    }
  };

  const toggleSettingsAmenities = (amenity: string) => {
    if (settingsAmenities.includes(amenity)) {
        setSettingsAmenities(settingsAmenities.filter(a => a !== amenity));
    } else {
        setSettingsAmenities([...settingsAmenities, amenity]);
    }
  };

  const toggleSettingsAntiquity = (val: string) => {
     // Single selection logic:
     // If clicking the one already selected, deselect it (optional, or keep it).
     // If clicking a new one, replace the entire array with the new value.
     if (settingsAntiquity.includes(val)) {
        setSettingsAntiquity([]); 
     } else {
        setSettingsAntiquity([val]);
     }
  };

  // Define navigation items with specific active colors (Solid fills)
  const navItems = [
    { 
      id: 'explore', 
      label: 'Explorar', 
      icon: Compass, 
      // Solid Blue
      activeClass: 'bg-primary-600 text-white shadow-lg shadow-primary-600/20',
      mobileTextClass: 'text-primary-600',
      mobileBgClass: 'bg-primary-50'
    },
    { 
      id: 'interests', 
      label: 'Interés en visitar', 
      icon: Heart, 
      // Solid Rose
      activeClass: 'bg-rose-600 text-white shadow-lg shadow-rose-600/20',
      mobileTextClass: 'text-rose-600',
      mobileBgClass: 'bg-rose-50'
    },
    { 
      id: 'visited', 
      label: 'Visitadas', 
      icon: History, 
      // Solid Emerald
      activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20',
      mobileTextClass: 'text-emerald-600',
      mobileBgClass: 'bg-emerald-50'
    },
    { 
      id: 'compare', 
      label: 'Comparar', 
      icon: GitCompare, 
      // Solid Orange (requested change from Amber)
      activeClass: 'bg-orange-500 text-white shadow-lg shadow-orange-500/20',
      mobileTextClass: 'text-orange-600',
      mobileBgClass: 'bg-orange-50'
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings, 
      // Solid Gray
      activeClass: 'bg-gray-800 text-white shadow-lg shadow-gray-800/20',
      mobileTextClass: 'text-gray-900',
      mobileBgClass: 'bg-gray-100'
    },
    { 
      id: 'help', 
      label: 'Ayuda', 
      icon: HelpCircle, 
      // Solid Gray
      activeClass: 'bg-gray-800 text-white shadow-lg shadow-gray-800/20',
      mobileTextClass: 'text-gray-900',
      mobileBgClass: 'bg-gray-100'
    },
  ];

  // If a property is selected, show the details view completely overlaying the content
  if (selectedProperty) {
    return (
      <PropertyDetails 
        property={selectedProperty} 
        onBack={() => setSelectedProperty(null)} 
        isFavorite={favorites.includes(selectedProperty.id)}
        onToggleFavorite={(e) => toggleFavorite(selectedProperty.id, e)}
      />
    );
  }

  // Logic for Sorting and Filtering
  const getProcessedProperties = () => {
    // 1. Filter by search
    let result = PROPERTIES_GRID_DATA.filter(p => 
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    if (sortOption === 'price_asc') {
       result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
       result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'area_asc') {
       result.sort((a, b) => (a.totalArea || 0) - (b.totalArea || 0));
    } else if (sortOption === 'area_desc') {
       result.sort((a, b) => (b.totalArea || 0) - (a.totalArea || 0));
    }
    // Note: 'neighborhood_group' is handled in the render logic
    
    return result;
  };

  const renderContent = () => {
    switch (currentView) {
      case 'explore':
        const processedProps = getProcessedProperties();
        const isGrouped = sortOption === 'neighborhood_group';

        return (
          <div className="space-y-8 animate-fade-in pb-24">
            
            {/* Minimalist Symmetric Header */}
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
               <div className="w-full max-w-3xl relative group z-20">
                  <div className="absolute inset-0 bg-primary-100/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 rounded-full p-2 pl-6 flex items-center gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                     <Search className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                     <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por dirección, barrio o ciudad..."
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm font-medium h-10"
                     />
                     <div className="h-6 w-px bg-gray-200"></div>
                     <button 
                        onClick={() => setIsSortPanelOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
                     >
                        {sortOption === 'neighborhood_group' ? <Layers size={16} /> : <AlignLeft size={16} />}
                        <span>Ordenar</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Grid Content */}
            {processedProps.length === 0 ? (
               <EmptyState icon={Search} title="No se encontraron propiedades" description="Intenta con otros términos de búsqueda." />
            ) : isGrouped ? (
               // Grouped View by Neighborhood
               <div className="space-y-12">
                  {Array.from(new Set(processedProps.map(p => p.neighborhood))).sort().map(hood => {
                     const hoodProps = processedProps.filter(p => p.neighborhood === hood);
                     return (
                        <div key={hood} className="animate-fade-in-up">
                           <div className="flex items-center gap-4 mb-6">
                              <h3 className="text-2xl font-bold text-gray-900">{hood}</h3>
                              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{hoodProps.length}</span>
                              <div className="h-px flex-1 bg-gray-100"></div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {hoodProps.map(prop => (
                                 <PropertyCard 
                                    key={prop.id} 
                                    prop={prop} 
                                    isFavorite={favorites.includes(prop.id)} 
                                    onToggleFavorite={toggleFavorite}
                                    onClick={() => handlePropertyClick(prop)}
                                 />
                              ))}
                           </div>
                        </div>
                     )
                  })}
               </div>
            ) : (
               // Standard Grid View
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {processedProps.map(prop => (
                   <PropertyCard 
                     key={prop.id} 
                     prop={prop} 
                     isFavorite={favorites.includes(prop.id)} 
                     onToggleFavorite={toggleFavorite}
                     onClick={() => handlePropertyClick(prop)}
                   />
                 ))}
               </div>
            )}
          </div>
        );

      case 'interests':
        const interestedProps = PROPERTIES_GRID_DATA.filter(p => favorites.includes(p.id));
        
        return (
          <div className="space-y-8 animate-fade-in pb-24 max-w-[1600px] mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Favoritos e Intereses</h2>
                <p className="text-gray-500 mt-2">
                   Tienes <span className="font-bold text-gray-900">{interestedProps.length}</span> propiedades marcadas.
                </p>
              </div>
            </div>

            {/* Content Views - GALLERY ONLY */}
            {interestedProps.length === 0 ? (
               <EmptyState icon={Heart} title="Aún no tienes favoritos" description="Marca propiedades con 'Me interesa' para verlas aquí." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {interestedProps.map(prop => (
                    <div 
                        key={prop.id}
                        onClick={() => handlePropertyClick(prop)}
                        className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
                    >
                        <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                        
                        {/* Top Actions */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                          <button onClick={(e) => toggleFavorite(prop.id, e)} className="p-2 bg-white/20 backdrop-blur hover:bg-white rounded-full text-white hover:text-red-600 transition-colors">
                              <Heart size={18} className="fill-white hover:fill-red-600" />
                          </button>
                          <button className="p-2 bg-white/20 backdrop-blur hover:bg-white rounded-full text-white hover:text-primary-600 transition-colors">
                              <ArrowRight size={18} />
                          </button>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300 group-hover:-translate-y-2">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1 text-primary-300">{prop.neighborhood}</p>
                          <h3 className="text-xl font-bold leading-tight mb-2">{prop.title}</h3>
                          <div className="flex items-center justify-between border-t border-white/20 pt-3 mt-2">
                              <span className="text-2xl font-bold">{prop.currency} {prop.price.toLocaleString()}</span>
                              <div className="flex gap-2 text-xs font-medium text-gray-300">
                                <span>{prop.totalArea} m²</span> • <span>{prop.environments} Amb</span>
                              </div>
                          </div>
                        </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'visited':
        const visitedProps = PROPERTIES_GRID_DATA.filter(p => visitedIds.includes(p.id));
        
        if (visitedProps.length === 0) {
           return <EmptyState icon={History} title="Sin visitas registradas" description="Cuando agendes citas, aparecerán aquí." />;
        }

        return (
          <div className="space-y-10 animate-fade-in pb-24 max-w-[1400px] mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Visitadas anteriormente</h2>
              <p className="text-gray-500 mt-2">Historial de propiedades recorridas y tus notas personales.</p>
            </div>
            
            <div className="space-y-8">
               {visitedProps.map((prop, idx) => (
                 <div key={prop.id} className="group bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col xl:flex-row h-auto xl:h-80">
                    
                    {/* 1. Image Column */}
                    <div className="relative w-full xl:w-72 h-48 xl:h-full flex-shrink-0 bg-gray-100">
                        <img src={prop.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={prop.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                        <div className="absolute bottom-5 left-5 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/30">
                                    Visitada
                                </span>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{idx === 0 ? '15 Ene' : '12 Ene'}</p>
                            {/* Time Removed here */}
                        </div>
                    </div>

                    {/* 2. Details Column */}
                    <div className="flex-1 p-6 xl:p-8 flex flex-col justify-between bg-white relative">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 uppercase tracking-wider">
                                    {prop.propertyType}
                                </span>
                                {prop.status === 'pending' ? (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 uppercase tracking-wider flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Reservada
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Disponible
                                    </span>
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
                                {prop.title}
                            </h3>
                            
                            <p className="text-gray-500 text-sm flex items-center gap-2 mb-6">
                                <MapPin size={16} className="text-gray-400 flex-shrink-0" /> 
                                <span className="truncate">{prop.address}, {prop.neighborhood}</span>
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-600">
                                    <Ruler size={14} className="text-gray-400"/> {prop.totalArea} m²
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-600">
                                    <LayoutGrid size={14} className="text-gray-400"/> {prop.environments} Amb
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Precio</span>
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">{prop.currency} {prop.price.toLocaleString()}</span>
                            </div>
                            <button onClick={() => handlePropertyClick(prop)} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all group/btn">
                                <ArrowRight size={20} className="group-hover/btn:-rotate-45 transition-transform duration-300" />
                            </button>
                        </div>
                    </div>

                    {/* 3. Interaction Column */}
                    <div className="w-full xl:w-[380px] bg-gray-50/50 border-t xl:border-t-0 xl:border-l border-gray-100 p-6 xl:p-8 flex flex-col gap-5">
                        
                        {/* Rating */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tu Calificación</span>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(star => (
                                    <Star 
                                        key={star} 
                                        size={18} 
                                        className={`cursor-pointer transition-all ${
                                            star <= (idx === 0 ? 4 : 0) 
                                            ? 'fill-amber-400 text-amber-400' 
                                            : 'fill-gray-200 text-gray-200 hover:fill-amber-200 hover:scale-110'
                                        }`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Feedback Agente */}
                        <div className="relative">
                            <div className="absolute -top-2.5 left-3">
                                <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100 shadow-sm flex items-center gap-1">
                                    <Users size={10} /> Feedback Agente
                                </span>
                            </div>
                            <div className="w-full bg-blue-50/30 border border-blue-100/50 rounded-xl p-4 pt-5 text-sm text-gray-600 leading-relaxed min-h-[80px] italic">
                                {idx === 0 ? "Me gustó mucho la luz del living. La cocina es un poco chica pero..." : "Sin comentarios registrados."}
                            </div>
                        </div>

                        {/* Private Note */}
                        <div className="relative flex-1">
                            <div className="absolute -top-2.5 left-3 z-10">
                                <span className="bg-white px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-200 shadow-sm flex items-center gap-1">
                                    <Lock size={10} /> Nota Privada
                                </span>
                            </div>
                            <textarea 
                                className="w-full h-full min-h-[80px] bg-white border border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:ring-0 rounded-xl p-4 pt-5 text-sm text-gray-700 resize-none outline-none transition-all placeholder:text-gray-400"
                                placeholder="Escribe aquí..."
                                defaultValue={idx === 0 ? "Consultar si aceptan mascota." : ""}
                            ></textarea>
                        </div>

                    </div>

                 </div>
               ))}
            </div>
          </div>
        );
      
      case 'compare':
         // Using the first 3 properties for demo comparison, as requested "maximo 3"
         const compareProps = PROPERTIES_GRID_DATA.slice(0, 3); 

         return (
            <div className="space-y-6 animate-fade-in h-full flex flex-col">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900">Comparar Propiedades</h2>
                   <p className="text-gray-500 text-sm mt-1">Analiza las diferencias y encuentra la mejor opción.</p>
                 </div>
                 <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                   {compareProps.length} propiedades seleccionadas
                 </div>
               </div>

               <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col relative">
                  <div className="overflow-x-auto custom-scrollbar pb-4 flex-1">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr>
                          {/* Sticky First Column Header */}
                          <th className="sticky left-0 z-20 bg-white p-6 min-w-[200px] border-b border-gray-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] align-top">
                            <div className="h-full flex flex-col justify-end pb-4">
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Atributos</span>
                            </div>
                          </th>
                          
                          {/* Property Headers */}
                          {compareProps.map(prop => (
                            <th key={prop.id} className="p-6 min-w-[320px] border-b border-gray-100 align-top group">
                               <div className="relative">
                                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden mb-4 relative">
                                    <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <button className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors backdrop-blur-sm">
                                       <X size={16} />
                                    </button>
                                  </div>
                                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{prop.title}</h3>
                                  <p className="text-sm text-gray-500 font-medium mb-3">{prop.address}</p>
                               </div>
                            </th>
                          ))}
                          
                          {/* Add Slot Header */}
                          {compareProps.length < 3 && (
                              <th className="p-6 min-w-[200px] border-b border-gray-100 align-middle">
                                 <button className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50/30 transition-all group">
                                    <div className="p-3 bg-gray-50 group-hover:bg-white rounded-full shadow-sm transition-colors">
                                      <PlusCircle size={24} />
                                    </div>
                                    <span className="text-sm font-medium">Agregar otra</span>
                                 </button>
                              </th>
                          )}
                        </tr>
                      </thead>
                      
                      <tbody className="text-gray-600 text-sm">
                        {/* Feature Rows - Reordered as requested */}
                        {[
                          { label: 'Precio', icon: DollarSign, key: 'price', format: (v: any, p: any) => <span className="font-bold text-lg text-gray-900">{p.currency} {v.toLocaleString()}</span> },
                          { label: 'Expensas', icon: DollarSign, key: 'expenses', format: (v: any) => v ? `$ ${v.toLocaleString()}` : '-' },
                          { label: 'Superficie Total', icon: Ruler, key: 'totalArea', format: (v: any) => <span className="font-semibold text-gray-900">{v} m²</span> },
                          { label: 'Superficie Cubierta', icon: Home, key: 'coveredArea', format: (v: any) => `${v} m²` },
                          { label: 'Ambientes', icon: LayoutGrid, key: 'environments', format: (v: any) => <span className="font-semibold text-gray-900">{v}</span> },
                          { label: 'Dormitorios', icon: Bed, key: 'bedrooms', format: (v: any) => v },
                          { label: 'Baños', icon: Bath, key: 'bathrooms', format: (v: any) => v },
                          { label: 'Cochera', icon: Car, key: 'amenities', format: (v: string[]) => v?.some(a => a.toLowerCase().includes('cochera') || a.toLowerCase().includes('garage')) ? <span className="text-emerald-600 font-medium flex items-center gap-1"><Check size={14}/> Sí</span> : <span className="text-gray-400">No</span> },
                          { label: 'Apto Profesional', icon: Briefcase, key: 'isProfessionalSuitable', format: (v: any) => v ? <span className="text-emerald-600 font-medium flex items-center gap-1"><Check size={14}/> Sí</span> : <span className="text-gray-400">No</span> },
                          { label: 'Apto Crédito', icon: Check, key: 'isCreditSuitable', format: (v: any) => v ? <span className="text-emerald-600 font-medium flex items-center gap-1"><Check size={14}/> Sí</span> : <span className="text-gray-400">No</span> },
                          { label: 'Antigüedad', icon: Calendar, key: 'antiquity', format: (v: any) => `${v} años` },
                          { label: 'Barrio', icon: MapPin, key: 'neighborhood', format: (v: any) => v },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                             <td className="sticky left-0 bg-white z-10 p-6 border-b border-gray-50 font-medium text-gray-500 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-2">
                                  {row.icon && <row.icon size={16} className="text-primary-300" />}
                                  {row.label}
                                </div>
                             </td>
                             {compareProps.map(prop => (
                               <td key={prop.id} className="p-6 border-b border-gray-50 align-middle">
                                  {/* @ts-ignore */}
                                  {row.format ? row.format(prop[row.key], prop) : prop[row.key] || '-'}
                               </td>
                             ))}
                             {compareProps.length < 3 && <td className="p-6 border-b border-gray-50"></td>}
                          </tr>
                        ))}
                        
                        {/* Action Row */}
                        <tr>
                           <td className="sticky left-0 bg-white z-10 p-6 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]"></td>
                           {compareProps.map(prop => {
                              const isFavorite = favorites.includes(prop.id);
                              return (
                                <td key={prop.id} className="p-6 align-middle">
                                   <button 
                                     onClick={(e) => toggleFavorite(prop.id, e)}
                                     className={`w-full py-3 font-bold text-sm uppercase tracking-wide transition-all duration-300 ease-out flex items-center justify-center gap-2 rounded-xl border
                                         ${isFavorite 
                                           ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-md' 
                                           : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200'
                                         }`}
                                   >
                                      <Heart 
                                         size={18} 
                                         className={`transition-transform duration-300 ease-out ${isFavorite ? 'fill-white scale-110' : 'fill-transparent scale-100'}`} 
                                      />
                                      ME INTERESA VISITAR
                                   </button>
                                </td>
                              );
                           })}
                           {compareProps.length < 3 && <td></td>}
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
         );

      case 'settings':
         return (
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-24">
              
              {/* Left Column: Profile */}
              <div className="lg:col-span-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Perfil</h2>
                  <p className="text-gray-500 text-sm mt-1">Gestiona tu información personal.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 flex flex-col items-center">
                   <div className="relative group mb-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100">
                        <img src="https://picsum.photos/100/100?random=50" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <button className="absolute bottom-0 right-0 p-2.5 bg-primary-600 text-white rounded-full shadow-md hover:bg-primary-700 hover:scale-105 transition-all">
                        <Camera size={16} />
                      </button>
                   </div>
                   
                   <div className="w-full space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                         <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" defaultValue="Ana García" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all" />
                         </div>
                      </div>
                      
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="email" defaultValue="ana.garcia@gmail.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all" />
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-gray-500 uppercase ml-1">Teléfono</label>
                         <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="tel" defaultValue="+54 9 11 1234 5678" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all" />
                         </div>
                      </div>

                      <div className="pt-4">
                         <button className="w-full py-2.5 bg-gray-900 text-white font-medium rounded-xl shadow-lg shadow-gray-900/10 hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                           <Save size={16} /> Guardar Perfil
                         </button>
                      </div>
                   </div>
                </div>

                {/* Logout Button - Separated from Save */}
                <button 
                    onClick={onLogout}
                    className="w-full py-3 rounded-xl border border-gray-200 bg-white text-red-600 font-bold text-sm shadow-sm hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                >
                    <LogOut size={16} /> Cerrar Sesión
                </button>

              </div>

              {/* Right Column: Search Preferences */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Preferencias de Búsqueda</h2>
                  <p className="text-gray-500 text-sm mt-1">Personaliza qué tipo de propiedades te interesan.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 space-y-8">
                   
                   {/* Section 1: Basic Operation & Price */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Briefcase size={16} /> Tipo de Operación</label>
                         <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <button 
                                onClick={() => setSettingsOperation('Venta')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg shadow-sm border transition-all ${settingsOperation === 'Venta' ? 'bg-white text-primary-600 border-gray-100' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700'}`}
                            >
                                Venta
                            </button>
                            <button 
                                onClick={() => setSettingsOperation('Alquiler')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg shadow-sm border transition-all ${settingsOperation === 'Alquiler' ? 'bg-white text-primary-600 border-gray-100' : 'bg-transparent text-gray-500 border-transparent hover:text-gray-700'}`}
                            >
                                Alquiler
                            </button>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Building size={16} /> Tipo de Propiedad</label>
                         <div className="flex flex-wrap gap-2">
                            {['Departamento', 'Casa', 'PH', 'Terreno', 'Local', 'Oficina', 'Galpón'].map(type => {
                                const isSelected = settingsPropertyTypes.includes(type);
                                return (
                                    <button 
                                        key={type} 
                                        onClick={() => toggleSettingsPropertyType(type)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                            isSelected 
                                            ? 'bg-primary-50 text-primary-700 border-primary-200' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-200 hover:text-primary-600'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                )
                            })}
                         </div>
                      </div>

                      {/* AMENITIES SECTION */}
                      {settingsPropertyTypes.includes('Departamento') && (
                        <div className="md:col-span-2 space-y-3 animate-fade-in">
                            <div className="bg-white p-4 rounded-2xl border-2 border-primary-100/50 shadow-sm">
                                <label className="text-sm font-bold text-primary-700 flex items-center gap-2 mb-3">
                                    <Sparkles size={16} /> Amenities Deseados
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Seguridad 24hs', 'Lavadero', 'Balcón Terraza'].map(tag => {
                                        const isSelected = settingsAmenities.includes(tag);
                                        return (
                                            <button 
                                                key={tag} 
                                                onClick={() => toggleSettingsAmenities(tag)}
                                                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all shadow-sm flex items-center gap-1.5 ${
                                                    isSelected 
                                                    ? 'bg-primary-50 border-primary-200 text-primary-700' 
                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                                                }`}
                                            >
                                                {isSelected && <Check size={14} strokeWidth={2.5} />}
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                      )}

                      <div className="md:col-span-2 space-y-4">
                          <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><DollarSign size={16} /> Rango de Precios (USD)</label>
                          <div className="flex items-center gap-4">
                             <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Min</span>
                                <input type="number" placeholder="0" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all" />
                             </div>
                             <span className="text-gray-300">-</span>
                             <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Max</span>
                                <input type="number" placeholder="Sin límite" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all" />
                             </div>
                          </div>
                      </div>
                   </div>

                   <hr className="border-gray-100" />

                   {/* Section 2: Dimensions & Distribution */}
                   <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 text-primary-600">Dimensiones y Distribución</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500">Metros Cuadrados (m²)</label>
                            <div className="flex items-center gap-3">
                               <input type="number" placeholder="Min" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:border-primary-300 outline-none transition-all" />
                               <span className="text-gray-300">-</span>
                               <input type="number" placeholder="Max" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:border-primary-300 outline-none transition-all" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500">Ambientes</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                               {[1, 2, 3, 4, '5+'].map((num) => (
                                  <button key={num} className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white transition-all border border-transparent hover:border-gray-100">
                                     {num}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500">Dormitorios</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                               {[1, 2, 3, 4, '5+'].map((num) => (
                                  <button key={num} className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white transition-all border border-transparent hover:border-gray-100">
                                     {num}
                                  </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500">Baños</label>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                               {[1, 2, 3, '4+'].map((num) => (
                                  <button key={num} className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white transition-all border border-transparent hover:border-gray-100">
                                     {num}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <hr className="border-gray-100" />

                   {/* Section 3: Features & Specifics */}
                   <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 text-primary-600">Características Específicas</h3>
                      
                      <div className="mb-8">
                         <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase">Antigüedad</h4>
                         <div className="flex flex-wrap gap-2">
                            {['A estrenar', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años', 'Más de 20 años'].map(range => {
                                const isSelected = settingsAntiquity.includes(range);
                                return (
                                    <button 
                                        key={range}
                                        onClick={() => toggleSettingsAntiquity(range)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                            isSelected 
                                            ? 'bg-primary-50 text-primary-700 border-primary-200' 
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary-200 hover:text-primary-600'
                                        }`}
                                    >
                                        {range}
                                    </button>
                                )
                            })}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-white transition-colors"><Check size={16} /></div>
                                <span className="text-sm font-medium text-gray-700">Apto Crédito</span>
                             </div>
                             <input type="checkbox" className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                          </label>
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-white transition-colors"><Briefcase size={16} /></div>
                                <span className="text-sm font-medium text-gray-700">Apto Profesional</span>
                             </div>
                             <input type="checkbox" className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                          </label>
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-white transition-colors"><Car size={16} /></div>
                                <span className="text-sm font-medium text-gray-700">Cochera</span>
                             </div>
                             <input type="checkbox" className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                          </label>
                      </div>
                   </div>

                   <hr className="border-gray-100" />

                   {/* Section 4: Location */}
                   <div className="space-y-6">
                      
                      <div className="space-y-3">
                         <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin size={16} /> Barrios de Preferencia</label>
                         <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 flex flex-wrap gap-2 min-h-[50px]">
                            <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium text-gray-800 flex items-center gap-2 shadow-sm">
                               Palermo <button className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                            </span>
                            <span className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium text-gray-800 flex items-center gap-2 shadow-sm">
                               Belgrano <button className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                            </span>
                            <input type="text" placeholder="Agregar barrio..." className="bg-transparent text-sm p-1 outline-none flex-1 min-w-[120px]" />
                         </div>
                      </div>
                   </div>

                   <div className="pt-4 flex justify-end">
                      <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all active:scale-95 flex items-center gap-2">
                        <Save size={18} /> Guardar Preferencias
                      </button>
                   </div>

                </div>
              </div>

            </div>
         );
      
      case 'help':
         return <EmptyState icon={HelpCircle} title="Centro de Ayuda" description="Contacta a soporte o revisa las preguntas frecuentes." />;

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 bg-white border-r border-gray-100 flex-col h-full flex-shrink-0 z-20">
         <div className="p-8">
            <div className="flex items-center gap-3 text-primary-600 mb-8">
               <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/20">L</div>
               <span className="text-2xl font-bold tracking-tight text-gray-900">LinkProp</span>
            </div>
            
            <nav className="space-y-2">
               {navItems.map(item => (
                  <button
                     key={item.id}
                     onClick={() => setCurrentView(item.id as ClientView)}
                     className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        currentView === item.id
                        ? item.activeClass
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                     }`}
                  >
                     <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
                     {item.label}
                     {item.id === 'interests' && favorites.length > 0 && (
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentView === 'interests' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                           {favorites.length}
                        </span>
                     )}
                  </button>
               ))}
            </nav>
         </div>

         <div className="mt-auto p-6 border-t border-gray-100">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
               <img src="https://picsum.photos/100/100?random=50" alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">Ana García</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <p className="text-xs font-medium text-emerald-700 truncate">Cliente Activo</p>
                  </div>
               </div>
             </div>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
         {/* Mobile Header */}
         <div className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-10">
            <div className="flex items-center gap-2 text-primary-600">
               <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
               <span className="text-lg font-bold text-gray-900">LinkProp</span>
            </div>
            <img src="https://picsum.photos/100/100?random=50" alt="User" className="w-8 h-8 rounded-full object-cover" />
         </div>

         <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
            <div className="max-w-7xl mx-auto h-full">
               {renderContent()}
            </div>
         </div>

         {/* Mobile Bottom Nav */}
         <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16 px-1">
               {navItems.slice(0, 5).map((item) => { // Show first 5 items only on mobile
                  const isActive = currentView === item.id;
                  return (
                  <button
                     key={item.id}
                     onClick={() => setCurrentView(item.id as ClientView)}
                     className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                        isActive ? item.mobileTextClass : 'text-gray-400 hover:text-gray-600'
                     }`}
                  >
                     <div className={`p-1 rounded-lg ${isActive ? item.mobileBgClass : ''}`}>
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                     </div>
                     <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
                  </button>
                  );
               })}
            </div>
         </nav>
         
         {/* Sort Side Panel */}
         <SortPanel 
            isOpen={isSortPanelOpen} 
            onClose={() => setIsSortPanelOpen(false)} 
            selectedOption={sortOption}
            onSelectOption={setSortOption}
         />
         
      </main>

    </div>
  );
};

// --- Sub Components ---

interface SortPanelProps {
   isOpen: boolean;
   onClose: () => void;
   selectedOption: SortOption;
   onSelectOption: (opt: SortOption) => void;
}

const SortPanel = ({ isOpen, onClose, selectedOption, onSelectOption }: SortPanelProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleSelect = (opt: SortOption) => {
     onSelectOption(opt);
     onClose(); // Close panel after selection
  };

  const options: { id: SortOption; label: string; icon: any; desc: string }[] = [
    { id: 'default', label: 'Relevancia', icon: Star, desc: 'Orden predeterminado por LinkProp' },
    { id: 'price_asc', label: 'Menor Precio', icon: ArrowDownUp, desc: 'De más barato a más caro' },
    { id: 'price_desc', label: 'Mayor Precio', icon: ArrowUpDown, desc: 'De más caro a más barato' },
    { id: 'area_desc', label: 'Mayor Superficie', icon: Ruler, desc: 'Ordenado por metros cuadrados totales' },
    { id: 'neighborhood_group', label: 'Agrupar por Barrio', icon: Layers, desc: 'Organiza las propiedades en secciones' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900">Ordenar Por</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">
           {options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                 <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-4 group ${
                       isSelected 
                       ? 'bg-primary-50 border-primary-200 shadow-sm' 
                       : 'bg-white border-gray-100 hover:border-primary-200 hover:shadow-sm'
                    }`}
                 >
                    <div className={`p-2.5 rounded-full shrink-0 ${isSelected ? 'bg-white text-primary-600' : 'bg-gray-50 text-gray-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors'}`}>
                       <opt.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{opt.label}</span>
                          {isSelected && <Check size={16} className="text-primary-600" />}
                       </div>
                       <p className={`text-xs mt-1 truncate ${isSelected ? 'text-primary-700' : 'text-gray-500'}`}>
                          {opt.desc}
                       </p>
                    </div>
                 </button>
              );
           })}
        </div>

      </div>
    </>
  );
};

const PropertyCard = ({ prop, isFavorite, onToggleFavorite, onClick }: any) => {
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

  // Check if property has Garage/Cochera in amenities
  const hasGarage = prop.amenities?.some((a: string) => a.toLowerCase().includes('cochera') || a.toLowerCase().includes('garage'));

  return (
   <div 
     onClick={onClick}
     className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
   >
      <div className="relative aspect-[4/3] overflow-hidden">
         <img 
            src={prop.imageUrl} 
            alt={prop.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
         />
         <div className="absolute bottom-3 left-3">
            {getStatusBadge(prop.status)}
         </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-3">
         <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{prop.currency} {prop.price.toLocaleString()}</h3>
         </div>
         <h4 className="font-medium text-base text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors leading-snug">{prop.title}</h4>
         <p className="text-gray-500 text-sm flex items-center gap-1 line-clamp-1">
            <MapPin size={16} className="flex-shrink-0" /> {prop.address}, {prop.neighborhood}
         </p>
         
         <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-gray-100 pt-3 mt-auto overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1 whitespace-nowrap"><b className="text-gray-900">{prop.area}</b> m²</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
            <span className="flex items-center gap-1 whitespace-nowrap"><b className="text-gray-900">{prop.environments}</b> Amb</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
            <span className="flex items-center gap-1 whitespace-nowrap"><b className="text-gray-900">{prop.bedrooms || 1}</b> Dorm</span>
            
            {/* New Cochera Indicator */}
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

      {/* Attached Footer Button */}
      <button 
        onClick={(e) => onToggleFavorite(prop.id, e)}
        className={`w-full py-4 font-bold text-sm uppercase tracking-wide transition-all duration-300 ease-out flex items-center justify-center gap-2
            ${isFavorite 
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-primary-600 border-t border-gray-100'
            }`}
      >
         <Heart 
            size={18} 
            className={`transition-transform duration-300 ease-out ${isFavorite ? 'fill-white scale-110' : 'fill-transparent scale-100'}`} 
         />
         ME INTERESA VISITAR
      </button>
   </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
   <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
         <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
   </div>
);
