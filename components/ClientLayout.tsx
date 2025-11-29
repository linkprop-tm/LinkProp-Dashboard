
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  LogOut, Search, Heart, MapPin, Home, Filter, ArrowRight,
  Compass, History, Scale, Settings, HelpCircle, Menu,
  ChevronRight, Calendar, Check, X, PlusCircle, DollarSign, Ruler, LayoutGrid,
  Car, Briefcase, Bed, Bath, PenTool, Quote, StickyNote, Star,
  User, Mail, Phone, Camera, Save, Sparkles, Building, Minus, Plus,
  ArrowUpDown, ArrowDownUp, Layers, AlignLeft, Users, Lock,
  List, Image as ImageIcon, Table as TableIcon, Columns, MoreHorizontal, Send, CheckCircle2,
  Monitor, Grid, Smartphone, Trash2, AlertCircle, HeartOff, Shield, Key, ArrowUp, ArrowDown, Map,
  FileQuestion, MessageCircle, BookOpen, Cat
} from 'lucide-react';
import { PROPERTIES_GRID_DATA } from '../constants';
import { PropertyDetails } from './PropertyDetails';
import { Property } from '../types';
import { Visited } from './Visited';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../lib/contexts/AuthContext';
import { Avatar } from './Avatar';
import { UploadPhotoModal } from './UploadPhotoModal';

interface ClientLayoutProps {
  onLogout: () => void;
}

type ClientView = 'explore' | 'interests' | 'visited' | 'compare' | 'settings';
type SortOption = 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc' | 'neighborhood_group' | 'default';

// --- LOCAL COMPONENTS ---

const EmptyState: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
       <Icon size={40} strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto">{description}</p>
  </div>
);

const PropertyCardVariant3: React.FC<{ 
    prop: Property; 
    isFavorite: boolean; 
    onToggleFavorite: (id: string, e: React.MouseEvent) => void;
    onClick: () => void;
    isInComparison: boolean;
    onToggleCompare: (id: string, e: React.MouseEvent) => void;
}> = ({ prop, isFavorite, onToggleFavorite, onClick, isInComparison, onToggleCompare }) => {
    
    const getStatusBadge = () => {
         if (prop.status === 'pending') {
            return (
               <span className="bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/20">
                  Reservada
               </span>
            );
         }
         if (prop.status === 'sold') {
            return (
               <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/20">
                  Vendida
               </span>
            );
         }
         return (
            <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-white/20">
               <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Disponible
            </span>
         );
    };

    return (
        <div 
            onClick={onClick}
            className="group flex flex-col gap-3 h-full cursor-pointer"
        >
            {/* Image Section - Standalone rounded card */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl group-hover:shadow-gray-200/50 transition-all duration-300 border border-gray-100 bg-gray-100">
                <img 
                    src={prop.imageUrl} 
                    alt={prop.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                
                {/* Top Left: Status */}
                <div className="absolute top-4 left-4 z-10">
                    {getStatusBadge()}
                </div>

                {/* Bottom Left: Price & Location */}
                <div className="absolute bottom-4 left-4 text-white z-10 max-w-[60%]">
                    <div className="text-2xl font-bold tracking-tight shadow-sm leading-tight mb-1">
                        {prop.currency} {prop.price.toLocaleString()}
                    </div>
                    <p className="text-xs font-medium text-white/90 flex items-center gap-1 truncate drop-shadow-md">
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">{prop.address}</span>
                    </p>
                </div>

                {/* Bottom Right: Specs (Area & Ambients) */}
                <div className="absolute bottom-4 right-4 z-10">
                     <div className="flex items-center gap-2 text-white text-xs font-bold bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-sm">
                        <span>{prop.totalArea || prop.area} m²</span>
                        <span className="w-0.5 h-3 bg-white/40 rounded-full"></span>
                        <span>{prop.environments} Amb</span>
                     </div>
                </div>
            </div>

            {/* Actions Section (Floating Separate Buttons) */}
            <div className="flex gap-3 px-1 mt-auto">
                 <button 
                    onClick={(e) => onToggleFavorite(prop.id, e)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all border shadow-sm ${
                        isFavorite 
                        ? 'bg-rose-50 text-rose-600 border-rose-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:shadow-md'
                    }`}
                 >
                    <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                    {isFavorite ? 'Me interesa' : 'Me interesa'}
                 </button>

                 <button 
                    onClick={(e) => onToggleCompare(prop.id, e)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all border shadow-sm ${
                        isInComparison 
                        ? 'bg-orange-50 text-orange-600 border-orange-200' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:shadow-md'
                    }`}
                 >
                    <Scale size={18} />
                    {isInComparison ? 'Comparando' : 'Comparar'}
                 </button>
            </div>
        </div>
    );
};

const SortPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedOption: SortOption;
    onSelectOption: (opt: SortOption) => void;
}> = ({ isOpen, onClose, selectedOption, onSelectOption }) => {
    if (!isOpen) return null;
    
    const options: { id: SortOption, label: string, icon: any }[] = [
        { id: 'default', label: 'Relevancia', icon: Star },
        { id: 'price_asc', label: 'Menor Precio', icon: ArrowDown },
        { id: 'price_desc', label: 'Mayor Precio', icon: ArrowUp },
        { id: 'area_desc', label: 'Mayor Superficie', icon: Ruler },
        { id: 'neighborhood_group', label: 'Agrupar por Barrio', icon: Layers },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-80 bg-white h-full shadow-2xl p-6 animate-fade-in-right">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-gray-900">Ordenar por</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                </div>
                
                <div className="space-y-2">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => {
                                onSelectOption(opt.id);
                                onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                selectedOption === opt.id 
                                ? 'bg-primary-50 text-primary-600 border border-primary-100' 
                                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <opt.icon size={18} />
                            {opt.label}
                            {selectedOption === opt.id && <Check size={16} className="ml-auto" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- CONSTANTS FOR NEIGHBORHOODS ---
const CABA_NEIGHBORHOODS = [
  "Puerto Madero", "Palermo Chico", "Recoleta", "Palermo Botánico", "Las Cañitas", 
  "Palermo", "Palermo Nuevo", "Palermo Soho", "Palermo Hollywood", "Belgrano", 
  "Núñez", "Colegiales", "Villa Devoto", "Villa Urquiza", "Retiro", "Saavedra", 
  "Coghlan", "Chacarita", "Villa Crespo", "Villa Pueyrredón", "Caballito", 
  "Villa del Parque", "Parque Chas", "Agronomía", "Villa Ortúzar", "Versalles", 
  "Villa Real", "Flores", "Floresta", "Villa Luro", "Monte Castro", 
  "Villa Santa Rita", "Villa General Mitre", "Boedo", "San Telmo", "Monserrat", 
  "San Nicolás", "Balvanera", "Almagro", "Barracas", "Parque Patricios", 
  "Constitución", "San Cristóbal", "La Paternal", "Parque Chacabuco", 
  "Nueva Pompeya", "Parque Avellaneda", "Mataderos", "Liniers", "La Boca", 
  "Villa Riachuelo", "Villa Lugano", "Villa Soldati"
];

const GBA_NEIGHBORHOODS = [
  "Vicente López", "San Martín", "San Isidro", "San Fernando", 
  "Tres de Febrero", "San Miguel", "Tigre", "Escobar", "Pilar", "José C. Paz"
];

// --- UTILITY FUNCTIONS ---

// Format number with thousand separators (dots) for display only
const formatNumberWithDots = (value: string): string => {
  if (!value) return '';
  // Remove all non-digit characters
  const numericOnly = value.replace(/\D/g, '');
  if (!numericOnly) return '';
  // Add dots every 3 digits from right to left
  return numericOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted number to get only digits (for state storage)
const parseNumericInput = (value: string): string => {
  // Remove all non-digit characters (including dots)
  return value.replace(/\D/g, '');
};

// Handle numeric input change - validates and formats
const handleNumericChange = (value: string, setter: (value: string) => void) => {
  // Only allow digits
  const numericOnly = value.replace(/\D/g, '');
  // Store pure number without formatting
  setter(numericOnly);
};

// --- MAIN COMPONENT ---

export const ClientLayout: React.FC<ClientLayoutProps> = ({ onLogout }) => {
  const { user } = useAuthContext();
  const [currentView, setCurrentView] = useState<ClientView>('explore');
  const [searchTerm, setSearchTerm] = useState('');
  // Expanded favorites list for demo purposes
  const [favorites, setFavorites] = useState<string[]>(['101', '102', '103', '104', '106', '108']);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Unmark Confirmation State
  const [showUnmarkModal, setShowUnmarkModal] = useState(false);
  const [propertyToUnmark, setPropertyToUnmark] = useState<string | null>(null);

  // Help Modal State
  const [activeHelpModal, setActiveHelpModal] = useState<'faq' | 'tutorial' | null>(null);

  // Comparison State
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  // Sort State
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Settings State
  const [settingsPropertyTypes, setSettingsPropertyTypes] = useState<string[]>(['Departamento']);
  const [settingsAmenities, setSettingsAmenities] = useState<string[]>(['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Lavadero']);
  const [settingsAntiquity, setSettingsAntiquity] = useState<string[]>(['Indiferente']);
  const [settingsOperation, setSettingsOperation] = useState('Venta');
  const [settingsPriceMin, setSettingsPriceMin] = useState<string>('');
  const [settingsPriceMax, setSettingsPriceMax] = useState<string>('');
  const [settingsM2Min, setSettingsM2Min] = useState<string>('');
  const [settingsM2Max, setSettingsM2Max] = useState<string>('');
  const [settingsAmbientes, setSettingsAmbientes] = useState<string>('');

  // Settings - Specific Features State
  const [settingsSpecifics, setSettingsSpecifics] = useState({
      credit: false,
      professional: false,
      garage: false,
      pets: false
  });

  const toggleSpecific = (key: keyof typeof settingsSpecifics) => {
      setSettingsSpecifics(prev => ({...prev, [key]: !prev[key]}));
  };

  // Settings - Location State
  const [settingsRegion, setSettingsRegion] = useState<'CABA' | 'GBA'>('CABA');
  const [settingsNeighborhoods, setSettingsNeighborhoods] = useState<string[]>(['Palermo Soho', 'Belgrano']);
  const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');
  const [isHoodDropdownOpen, setIsHoodDropdownOpen] = useState(false);
  const hoodInputRef = useRef<HTMLInputElement>(null);

  // Loading and Save States
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [preferencesSaveSuccess, setPreferencesSaveSuccess] = useState(false);
  const [preferencesSaveError, setPreferencesSaveError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoadingProfile(true);
    setLoadingPreferences(true);

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          full_name,
          email,
          telefono,
          foto_perfil_url,
          preferencias_tipo,
          preferencias_operacion,
          preferencias_precio_min,
          preferencias_precio_max,
          preferencias_ubicacion,
          preferencias_amenities,
          preferencias_antiguedad,
          preferencias_m2_min,
          preferencias_ambientes,
          preferencias_apto_credito,
          preferencias_apto_profesional,
          preferencias_cochera,
          preferencias_apto_mascotas
        `)
        .eq('auth_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setName(data.full_name || '');
        setEmail(data.email || user.email || '');
        setPhone(data.telefono || '');
        setPhotoUrl(data.foto_perfil_url || null);

        setSettingsPropertyTypes(data.preferencias_tipo || ['Departamento']);
        setSettingsOperation(data.preferencias_operacion || 'Venta');
        setSettingsPriceMin(data.preferencias_precio_min?.toString() || '');
        setSettingsPriceMax(data.preferencias_precio_max?.toString() || '');
        setSettingsNeighborhoods(data.preferencias_ubicacion || ['Palermo Soho', 'Belgrano']);
        setSettingsAmenities(data.preferencias_amenities || ['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Lavadero']);
        setSettingsAntiquity(data.preferencias_antiguedad || ['Indiferente']);
        setSettingsM2Min(data.preferencias_m2_min?.toString() || '');
        setSettingsAmbientes(data.preferencias_ambientes || '');

        setSettingsSpecifics({
          credit: data.preferencias_apto_credito || false,
          professional: data.preferencias_apto_profesional || false,
          garage: data.preferencias_cochera || false,
          pets: data.preferencias_apto_mascotas || false
        });

        if (data.preferencias_ubicacion && data.preferencias_ubicacion.length > 0) {
          const firstNeighborhood = data.preferencias_ubicacion[0];
          if (GBA_NEIGHBORHOODS.includes(firstNeighborhood)) {
            setSettingsRegion('GBA');
          } else {
            setSettingsRegion('CABA');
          }
        }
      } else {
        setEmail(user.email || '');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingProfile(false);
      setLoadingPreferences(false);
    }
  };

  const handlePhotoUploadSuccess = (newPhotoUrl: string) => {
    setPhotoUrl(newPhotoUrl);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleSaveProfile = async () => {
    setProfileSaveError('');
    setProfileSaveSuccess(false);
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          full_name: name,
          telefono: phone,
        })
        .eq('auth_id', user?.id);

      if (error) throw error;

      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setProfileSaveError(error.message || 'Error al guardar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setPreferencesSaveError('');
    setPreferencesSaveSuccess(false);
    setSavingPreferences(true);

    try {
      const preferencesData: any = {
        preferencias_tipo: settingsPropertyTypes,
        preferencias_operacion: settingsOperation,
        preferencias_ubicacion: settingsNeighborhoods,
        preferencias_amenities: settingsAmenities,
        preferencias_antiguedad: settingsAntiquity,
        preferencias_apto_credito: settingsSpecifics.credit,
        preferencias_apto_profesional: settingsSpecifics.professional,
        preferencias_cochera: settingsSpecifics.garage,
        preferencias_apto_mascotas: settingsSpecifics.pets,
      };

      if (settingsPriceMin) {
        preferencesData.preferencias_precio_min = parseFloat(settingsPriceMin);
      }
      if (settingsPriceMax) {
        preferencesData.preferencias_precio_max = parseFloat(settingsPriceMax);
      }
      if (settingsM2Min) {
        preferencesData.preferencias_m2_min = parseFloat(settingsM2Min);
      }
      if (settingsAmbientes) {
        preferencesData.preferencias_ambientes = settingsAmbientes;
      }

      const { error } = await supabase
        .from('usuarios')
        .update(preferencesData)
        .eq('auth_id', user?.id);

      if (error) throw error;

      setPreferencesSaveSuccess(true);
      setTimeout(() => setPreferencesSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setPreferencesSaveError(error.message || 'Error al guardar las preferencias');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleLogout = async () => {
    console.log('[ClientLayout] Logout button clicked');
    setLogoutError('');
    setIsLoggingOut(true);

    try {
      console.log('[ClientLayout] Calling onLogout function...');
      await onLogout();
      console.log('[ClientLayout] Logout successful');
    } catch (error: any) {
      console.error('[ClientLayout] Logout error:', error);
      setLogoutError(error.message || 'Error al cerrar sesión');
      setTimeout(() => setLogoutError(''), 5000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoodInputRef.current && !hoodInputRef.current.parentElement?.contains(event.target as Node)) {
        setIsHoodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const toggleSettingsNeighborhood = (hood: string) => {
      if (settingsNeighborhoods.includes(hood)) {
          setSettingsNeighborhoods(settingsNeighborhoods.filter(h => h !== hood));
      } else {
          setSettingsNeighborhoods([...settingsNeighborhoods, hood]);
      }
      setNeighborhoodSearchTerm('');
      setIsHoodDropdownOpen(false);
  };
  
  const getFilteredNeighborhoods = () => {
      const term = neighborhoodSearchTerm.toLowerCase();
      if (!term) return [];
      
      const sourceList = settingsRegion === 'CABA' ? CABA_NEIGHBORHOODS : GBA_NEIGHBORHOODS;

      return sourceList.filter(hood => 
          hood.toLowerCase().includes(term) && 
          !settingsNeighborhoods.includes(hood)
      ).slice(0, 8); // Limit suggestions
  };


  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      // If already favorite, ask for confirmation
      setPropertyToUnmark(id);
      setShowUnmarkModal(true);
    } else {
      // If not favorite, add immediately
      setFavorites([...favorites, id]);
    }
  };

  const confirmUnmark = () => {
    if (propertyToUnmark) {
      setFavorites(favorites.filter(fid => fid !== propertyToUnmark));
      setShowUnmarkModal(false);
      setPropertyToUnmark(null);
    }
  };

  const cancelUnmark = () => {
    setShowUnmarkModal(false);
    setPropertyToUnmark(null);
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparisonList.includes(id)) {
      setComparisonList(comparisonList.filter(cid => cid !== id));
    } else {
      if (comparisonList.length >= 3) {
        // Simple visual feedback or toast could go here
        alert("Solo puedes comparar hasta 3 propiedades a la vez.");
        return;
      }
      setComparisonList([...comparisonList, id]);
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
     // Single selection logic for Antiquity
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
      icon: Scale, 
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
    }
  ];

  // Component for the Unmark Modal
  const UnmarkConfirmationModal = () => {
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
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 ring-4 ring-rose-50/50">
                    <HeartOff size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Ya no te interesa?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                   Al desmarcar esta propiedad, le indicas a tu agente que ya no deseas visitarla ni recibir actualizaciones sobre ella.
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
                     className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
                   >
                      Confirmar
                   </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  // If a property is selected, show the details view completely overlaying the content
  if (selectedProperty) {
    return (
      <>
        <PropertyDetails 
          property={selectedProperty} 
          onBack={() => setSelectedProperty(null)} 
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={(e) => toggleFavorite(selectedProperty.id, e)}
        />
        <UnmarkConfirmationModal />
      </>
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
            <div className="flex flex-col items-center justify-center pt-4">
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
               
            {/* Comparison Bar (Sticky) */}
            {comparisonList.length > 0 && (
                <div className="sticky top-6 z-40 flex justify-center pointer-events-none">
                    <div className="animate-fade-in-up flex items-center gap-3 pointer-events-auto">
                        <div className="bg-gray-900/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4 text-xs font-bold border border-white/10 ring-1 ring-black/5">
                            <span className="flex items-center gap-2">
                            <span className="bg-orange-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{comparisonList.length}</span>
                            <span>seleccionadas para comparar</span>
                            </span>
                            <div className="h-4 w-px bg-white/20"></div>
                            <button 
                            onClick={() => setCurrentView('compare')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95"
                            >
                            Ver Comparación <ArrowRight size={14} strokeWidth={2.5}/>
                            </button>
                            <button 
                            onClick={() => setComparisonList([])}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                            <X size={14}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {hoodProps.map(prop => (
                                 <PropertyCardVariant3 
                                    key={prop.id} 
                                    prop={prop} 
                                    isFavorite={favorites.includes(prop.id)} 
                                    onToggleFavorite={toggleFavorite}
                                    onClick={() => handlePropertyClick(prop)}
                                    isInComparison={comparisonList.includes(prop.id)}
                                    onToggleCompare={toggleCompare}
                                 />
                              ))}
                           </div>
                        </div>
                     )
                  })}
               </div>
            ) : (
               // Standard Grid View - Now 2 columns max for larger cards
               <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                 {processedProps.map(prop => (
                   <PropertyCardVariant3 
                     key={prop.id} 
                     prop={prop} 
                     isFavorite={favorites.includes(prop.id)} 
                     onToggleFavorite={toggleFavorite}
                     onClick={() => handlePropertyClick(prop)}
                     isInComparison={comparisonList.includes(prop.id)}
                     onToggleCompare={toggleCompare}
                   />
                 ))}
               </div>
            )}
          </div>
        );

      case 'interests':
        const interestedProps = PROPERTIES_GRID_DATA.filter(p => favorites.includes(p.id));
        return (
          <div className="space-y-8 animate-fade-in pb-24">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Favoritos e Intereses</h2>
                <p className="text-gray-500 mt-2">
                   Tienes <span className="font-bold text-gray-900">{interestedProps.length}</span> propiedades marcadas.
                </p>
              </div>
            </div>
            {interestedProps.length === 0 ? (
               <EmptyState icon={Heart} title="Aún no tienes favoritos" description="Marca propiedades con 'Me interesa' para verlas aquí." />
            ) : (
              <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
                  {interestedProps.map(prop => (
                    <PropertyCardVariant3 
                        key={prop.id}
                        prop={prop}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => handlePropertyClick(prop)}
                        isInComparison={comparisonList.includes(prop.id)}
                        onToggleCompare={toggleCompare}
                    />
                  ))}
              </div>
            )}
          </div>
        );

      case 'visited':
        return <Visited onPropertyClick={handlePropertyClick} />;

      case 'compare':
        const compareProps = PROPERTIES_GRID_DATA.filter(p => comparisonList.includes(p.id));
        
        if (compareProps.length === 0) {
           return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center p-6">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-6 relative">
                   <Scale size={40} strokeWidth={1.5} />
                   <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-xs font-bold text-gray-400 border border-gray-100">0</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Compara Propiedades</h2>
                <p className="text-gray-500 max-w-md mb-8">
                   Selecciona hasta 3 propiedades en la sección Explorar o Favoritos usando el botón de comparar <Scale className="inline mx-1" size={14} /> para ver sus características lado a lado.
                </p>
                <button 
                  onClick={() => setCurrentView('explore')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
                >
                   Ir a Explorar
                </button>
             </div>
           )
        }

        return (
           <div className="animate-fade-in pb-24">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-3xl font-bold text-gray-900">Comparativa</h2>
                    <p className="text-gray-500 mt-2">Analizando {compareProps.length} propiedades seleccionadas.</p>
                 </div>
                 <button 
                    onClick={() => setComparisonList([])}
                    className="group flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-all duration-300 shadow-sm border border-gray-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 active:scale-95"
                 >
                    <Trash2 size={18} strokeWidth={2} className="transition-transform duration-300 group-hover:rotate-12" />
                    <span className="text-sm font-bold tracking-wide">Limpiar Comparación</span>
                 </button>
              </div>

              {/* Comparison Table Container */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                 <div className="min-w-[800px]">
                    
                    {/* Header Row: Images & Titles */}
                    <div className="grid grid-cols-4 border-b border-gray-100">
                       <div className="p-6 bg-gray-50/50 flex items-center text-gray-400 font-bold text-xs uppercase tracking-wider">
                          Características
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-6 border-l border-gray-100 relative group">
                             <button 
                               onClick={(e) => toggleCompare(prop.id, e)}
                               className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors z-10 opacity-0 group-hover:opacity-100"
                             >
                                <Trash2 size={16} />
                             </button>
                             <div 
                                className="aspect-[4/3] rounded-xl overflow-hidden mb-4 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => handlePropertyClick(prop)}
                             >
                                <img src={prop.imageUrl} className="w-full h-full object-cover" alt={prop.title} />
                             </div>
                             <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{prop.title}</h3>
                             <p className="text-sm text-gray-500 mb-3 truncate">{prop.address}</p>
                             <div className="text-2xl font-bold text-primary-600">{prop.currency} {prop.price.toLocaleString()}</div>
                          </div>
                       ))}
                       {/* Empty Slots Fillers */}
                       {[...Array(3 - compareProps.length)].map((_, i) => (
                          <div key={i} className="p-6 border-l border-gray-100 flex flex-col items-center justify-center text-center bg-gray-50/30">
                             <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
                                <PlusCircle size={32} />
                             </div>
                             <p className="text-sm font-bold text-gray-400">Espacio Disponible</p>
                             <button onClick={() => setCurrentView('explore')} className="mt-2 text-xs font-bold text-primary-600 hover:underline">Agregar Propiedad</button>
                          </div>
                       ))}
                    </div>

                    {/* Data Rows */}
                    
                    {/* Row: Location */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <MapPin size={16} className="text-gray-400" /> Ubicación
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             {prop.neighborhood}, {prop.province}
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                    {/* Row: Expenses */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <DollarSign size={16} className="text-gray-400" /> Expensas
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             $ {prop.expenses?.toLocaleString() || '-'}
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                    {/* Row: Total Area */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <Ruler size={16} className="text-gray-400" /> Superficie Total
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             {prop.totalArea || prop.area} m²
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                    {/* Row: Covered Area */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <Home size={16} className="text-gray-400" /> Superficie Cubierta
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             {prop.coveredArea} m²
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                    {/* Row: Environments */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <LayoutGrid size={16} className="text-gray-400" /> Ambientes
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             {prop.environments}
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>
                     
                     {/* Row: Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <Bed size={16} className="text-gray-400" /> Dorms / Baños
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             {prop.bedrooms} Dorms • {prop.bathrooms} Baños
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                    {/* Row: Antiquity */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <Calendar size={16} className="text-gray-400" /> Antigüedad
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-sm text-gray-700 font-medium">
                             {prop.antiquity} años
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                    {/* Row: Features (Booleans) */}
                    <div className="grid grid-cols-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm">
                          <CheckCircle2 size={16} className="text-gray-400" /> Características
                       </div>
                       {compareProps.map(prop => {
                           const hasGarage = prop.amenities?.some(a => a.toLowerCase().includes('cochera') || a.toLowerCase().includes('garage'));
                           return (
                              <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-xs space-y-2">
                                  <div className={`flex items-center gap-2 ${hasGarage ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                                      {hasGarage ? <Check size={14} className="text-emerald-500"/> : <X size={14}/>} Cochera
                                  </div>
                                  <div className={`flex items-center gap-2 ${prop.isProfessionalSuitable ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                                      {prop.isProfessionalSuitable ? <Check size={14} className="text-emerald-500"/> : <X size={14}/>} Apto Prof.
                                  </div>
                                  <div className={`flex items-center gap-2 ${prop.isCreditSuitable ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                                      {prop.isCreditSuitable ? <Check size={14} className="text-emerald-500"/> : <X size={14}/>} Apto Crédito
                                  </div>
                              </div>
                           )
                       })}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>
                     
                    {/* Row: Amenities */}
                    <div className="grid grid-cols-4 hover:bg-gray-50/50 transition-colors">
                       <div className="p-4 px-6 flex items-center gap-2 font-bold text-gray-600 text-sm align-top">
                          <Sparkles size={16} className="text-gray-400" /> Amenities
                       </div>
                       {compareProps.map(prop => (
                          <div key={prop.id} className="p-4 px-6 border-l border-gray-100 text-xs text-gray-600 leading-relaxed">
                             {prop.amenities?.join(' • ')}
                          </div>
                       ))}
                       {[...Array(3 - compareProps.length)].map((_, i) => <div key={i} className="border-l border-gray-100"></div>)}
                    </div>

                 </div>
              </div>
           </div>
        );

      case 'settings':
         return (
            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-24">
              {/* Left Column: Profile (Span 4) */}
              <div className="lg:col-span-4 space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">Perfil</h2>
                    <p className="text-gray-500 text-sm mt-1">Gestiona tu información personal.</p>
                 </div>
                 
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    {loadingProfile ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="text-gray-400 text-sm">Cargando perfil...</div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-shrink-0 mx-auto text-center mb-6">
                            <div className="relative inline-block">
                                <div className="rounded-full overflow-hidden border-[6px] border-white shadow-xl ring-1 ring-gray-100">
                                    <Avatar
                                      src={photoUrl}
                                      name={name || 'Usuario'}
                                      size="xlarge"
                                    />
                                </div>
                                <button
                                  onClick={() => setIsUploadModalOpen(true)}
                                  className="absolute bottom-1 right-1 p-2.5 bg-gray-900 text-white rounded-full hover:bg-black hover:shadow-lg transition-colors duration-200 shadow-md border-[3px] border-white"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Foto de Perfil</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                      type="text"
                                      value={name}
                                      onChange={(e) => setName(e.target.value)}
                                      placeholder="Tu nombre completo"
                                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                      type="email"
                                      value={email}
                                      readOnly
                                      disabled
                                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                      type="tel"
                                      value={phone}
                                      onChange={(e) => setPhone(e.target.value)}
                                      placeholder="+54 9 11..."
                                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {profileSaveSuccess && (
                          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                            <Save size={16} className="text-emerald-600" />
                            <p className="text-sm text-emerald-800 font-medium">Perfil guardado correctamente</p>
                          </div>
                        )}
                        {profileSaveError && (
                          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-600 mt-0.5" />
                            <p className="text-sm text-red-800">{profileSaveError}</p>
                          </div>
                        )}

                        <button
                          onClick={handleSaveProfile}
                          disabled={savingProfile}
                          className="w-full mt-6 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-3 rounded-xl shadow-lg shadow-gray-900/10 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Save size={16} />
                           {savingProfile ? 'Guardando...' : 'Guardar Perfil'}
                        </button>
                      </>
                    )}
                 </div>

                 {/* Security Card */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gray-50 text-gray-900 rounded-xl">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Seguridad</h3>
                            <p className="text-xs text-gray-500">Opciones de cuenta</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all group">
                            <div className="flex items-center gap-3">
                                <Key size={18} className="text-gray-400 group-hover:text-gray-600" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Cambiar Contraseña</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>

                        <div className="h-px bg-gray-100"></div>

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all group border border-transparent hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={18} className={isLoggingOut ? "text-red-600 animate-pulse" : "text-red-600"} />
                                <span className="text-sm font-bold text-red-700">
                                  {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                                </span>
                            </div>
                            {!isLoggingOut && <ChevronRight size={16} className="text-red-400 group-hover:text-red-500" />}
                        </button>

                        {logoutError && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-800">{logoutError}</p>
                          </div>
                        )}
                    </div>
                 </div>

                  {/* Help Card */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-gray-50 text-gray-900 rounded-xl">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Ayuda</h3>
                            <p className="text-xs text-gray-500">Centro de soporte</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => setActiveHelpModal('faq')}
                            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <FileQuestion size={18} className="text-gray-400 group-hover:text-gray-600" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Preguntas Frecuentes</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>

                        <div className="h-px bg-gray-100"></div>

                        <button 
                            onClick={() => setActiveHelpModal('tutorial')}
                            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen size={18} className="text-gray-400 group-hover:text-gray-600" />
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Como usar la plataforma</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300" />
                        </button>
                    </div>
                 </div>
                 
                 {/* Legal Links */}
                 <div className="flex flex-col gap-1 px-4 mt-2">
                    <button className="text-xs text-gray-400 hover:text-gray-800 font-medium text-left py-1 transition-colors">
                       Términos y Condiciones
                    </button>
                    <button className="text-xs text-gray-400 hover:text-gray-800 font-medium text-left py-1 transition-colors">
                       Política de Privacidad
                    </button>
                 </div>

              </div>

              {/* Right Column: Preferences (Span 8) */}
              <div className="lg:col-span-8 space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900">Preferencias de Búsqueda</h2>
                    <p className="text-gray-500 text-sm mt-1">Personaliza qué tipo de propiedades te interesan.</p>
                 </div>

                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
                    
                    {/* Row 1: Operation & Property Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Operation Type */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold text-sm">
                                <Briefcase size={18} className="text-gray-400" /> Tipo de Operación
                            </div>
                            <div className="bg-gray-50 p-1 rounded-xl flex border border-gray-100">
                                {['Venta', 'Alquiler'].map(op => (
                                    <button 
                                        key={op}
                                        onClick={() => setSettingsOperation(op)}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                            settingsOperation === op 
                                            ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                    >
                                        {op}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Property Type */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold text-sm">
                                <Building size={18} className="text-gray-400" /> Tipo de Propiedad
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Departamento', 'Casa', 'PH', 'Terreno', 'Local', 'Oficina', 'Galpón'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleSettingsPropertyType(type)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                            settingsPropertyTypes.includes(type)
                                            ? 'bg-primary-50 text-primary-600 border-primary-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Amenities - Conditionally rendered if 'Departamento' is selected */}
                    {settingsPropertyTypes.includes('Departamento') && (
                        <div className="p-6 bg-white rounded-xl border border-primary-100 shadow-[0_0_15px_rgba(37,99,235,0.05)]">
                            <div className="flex items-center gap-2 mb-4 text-primary-700 font-bold text-sm">
                                <Sparkles size={18} /> Amenities Deseados
                            </div>
                             <div className="flex flex-wrap gap-2">
                                {['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Lavadero', 'Balcón Terraza'].map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleSettingsAmenities(item)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                            settingsAmenities.includes(item)
                                            ? 'bg-white text-primary-600 border-primary-200 shadow-sm'
                                            : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Neighborhoods (Redesigned with Region) */}
                    <div>
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                <MapPin size={18} className="text-gray-400" /> Barrios de Preferencia
                            </div>
                         </div>
                         
                         {/* Region Selector */}
                         <div className="bg-gray-50 p-1 rounded-xl flex border border-gray-200 mb-4 max-w-md">
                            <button
                                onClick={() => setSettingsRegion('CABA')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                    settingsRegion === 'CABA' 
                                    ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                Capital Federal (CABA)
                            </button>
                            <button
                                onClick={() => setSettingsRegion('GBA')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                    settingsRegion === 'GBA' 
                                    ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                GBA / Provincia
                            </button>
                         </div>

                         <div className="space-y-4">
                            {/* Selected / Tag Input + Autocomplete Search */}
                            <div 
                                className="relative flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-300 transition-all"
                            >
                                {settingsNeighborhoods.map(hood => (
                                    <span key={hood} className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 border border-gray-200">
                                        {hood} <button onClick={() => toggleSettingsNeighborhood(hood)} className="hover:text-red-500 text-gray-400 transition-colors"><X size={14}/></button>
                                    </span>
                                ))}
                                <input 
                                    ref={hoodInputRef}
                                    type="text" 
                                    value={neighborhoodSearchTerm}
                                    onChange={(e) => {
                                        setNeighborhoodSearchTerm(e.target.value);
                                        setIsHoodDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsHoodDropdownOpen(true)}
                                    placeholder={`Buscar en ${settingsRegion === 'CABA' ? 'Capital' : 'Provincia'}...`} 
                                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1 min-w-[140px] placeholder:text-gray-400" 
                                />
                                
                                {/* Autocomplete Dropdown */}
                                {isHoodDropdownOpen && neighborhoodSearchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                        {getFilteredNeighborhoods().length > 0 ? (
                                            getFilteredNeighborhoods().map(hood => (
                                                <button
                                                    key={hood}
                                                    onClick={() => toggleSettingsNeighborhood(hood)}
                                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center justify-between group"
                                                >
                                                    {hood}
                                                    <PlusCircle size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-400 italic">No se encontraron resultados</div>
                                        )}
                                    </div>
                                )}
                            </div>

                         </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold text-sm">
                            <DollarSign size={18} className="text-gray-400" /> Rango de Precios (USD)
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Desde</span>
                                <input
                                  type="text"
                                  value={formatNumberWithDots(settingsPriceMin)}
                                  onChange={(e) => handleNumericChange(e.target.value, setSettingsPriceMin)}
                                  placeholder="0"
                                  className="w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all"
                                />
                            </div>
                            <span className="text-gray-300 font-medium">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Hasta</span>
                                <input
                                  type="text"
                                  value={formatNumberWithDots(settingsPriceMax)}
                                  onChange={(e) => handleNumericChange(e.target.value, setSettingsPriceMax)}
                                  placeholder="Sin límite"
                                  className="w-full pl-20 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dimensions & Distribution Section */}
                    <div className="pt-8 border-t border-gray-100 mt-8">
                         <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6">Dimensiones y Distribución</h3>
                         
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Area */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 block">Metros Cuadrados (m²)</label>
                                <div className="relative">
                                    <input
                                      type="text"
                                      value={formatNumberWithDots(settingsM2Min)}
                                      onChange={(e) => handleNumericChange(e.target.value, setSettingsM2Min)}
                                      placeholder="Min"
                                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center outline-none focus:bg-white focus:border-primary-300 transition-all"
                                    />
                                </div>
                            </div>
                            
                            {/* Ambientes - Segmented Control */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 block">Ambientes</label>
                                <div className="flex gap-1 bg-gray-50 rounded-xl p-1.5 border border-gray-200">
                                    {['1', '2', '3', '4', '5+'].map(val => (
                                        <button
                                          key={val}
                                          className="flex-1 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-all focus:bg-white focus:shadow-sm focus:text-primary-600"
                                        >{val}</button>
                                    ))}
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* Specifics */}
                    <div>
                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6">Características Específicas</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Antigüedad</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Indiferente', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años', 'Más de 20 años'].map(val => (
                                         <button
                                            key={val}
                                            onClick={() => toggleSettingsAntiquity(val)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                                settingsAntiquity.includes(val)
                                                ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Checkbox Cards (Interactive) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Apto Crédito / Apto Mascotas (Conditional based on Operation Type) */}
                                {settingsOperation === 'Venta' ? (
                                    <div 
                                        onClick={() => toggleSpecific('credit')}
                                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                            settingsSpecifics.credit 
                                            ? 'bg-green-50 border-green-200 shadow-sm' 
                                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${settingsSpecifics.credit ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
                                                <CheckCircle2 size={16} strokeWidth={2.5} />
                                            </div>
                                            <span className={`text-sm font-bold ${settingsSpecifics.credit ? 'text-green-800' : 'text-gray-700'}`}>Apto Crédito</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${settingsSpecifics.credit ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                                            {settingsSpecifics.credit && <Check size={14} strokeWidth={3}/>}
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => toggleSpecific('pets')}
                                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                            settingsSpecifics.pets 
                                            ? 'bg-green-50 border-green-200 shadow-sm' 
                                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${settingsSpecifics.pets ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
                                                <Cat size={16} strokeWidth={2.5} />
                                            </div>
                                            <span className={`text-sm font-bold ${settingsSpecifics.pets ? 'text-green-800' : 'text-gray-700'}`}>Apto Mascotas</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${settingsSpecifics.pets ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                                            {settingsSpecifics.pets && <Check size={14} strokeWidth={3}/>}
                                        </div>
                                    </div>
                                )}

                                {/* Apto Profesional */}
                                <div 
                                    onClick={() => toggleSpecific('professional')}
                                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                        settingsSpecifics.professional 
                                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                                    }`}
                                >
                                     <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${settingsSpecifics.professional ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                            <Briefcase size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-sm font-bold ${settingsSpecifics.professional ? 'text-blue-800' : 'text-gray-700'}`}>Apto Profesional</span>
                                     </div>
                                     <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${settingsSpecifics.professional ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white'}`}>
                                         {settingsSpecifics.professional && <Check size={14} strokeWidth={3}/>}
                                     </div>
                                </div>

                                {/* Cochera */}
                                <div 
                                    onClick={() => toggleSpecific('garage')}
                                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                        settingsSpecifics.garage 
                                        ? 'bg-orange-50 border-orange-200 shadow-sm' 
                                        : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${settingsSpecifics.garage ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                                            <Car size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-sm font-bold ${settingsSpecifics.garage ? 'text-orange-800' : 'text-gray-700'}`}>Cochera</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${settingsSpecifics.garage ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 bg-white'}`}>
                                         {settingsSpecifics.garage && <Check size={14} strokeWidth={3}/>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {preferencesSaveSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                        <Save size={16} className="text-emerald-600" />
                        <p className="text-sm text-emerald-800 font-medium">Preferencias guardadas correctamente</p>
                      </div>
                    )}
                    {preferencesSaveError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-600 mt-0.5" />
                        <p className="text-sm text-red-800">{preferencesSaveError}</p>
                      </div>
                    )}

                    {/* Footer Save */}
                    <div className="pt-6 flex justify-end">
                        <button
                          onClick={handleSavePreferences}
                          disabled={savingPreferences || loadingPreferences}
                          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           <Save size={20} />
                           {savingPreferences ? 'Guardando...' : 'Guardar Preferencias'}
                        </button>
                    </div>

                 </div>
              </div>
            </div>
         );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col h-full flex-shrink-0 z-20">
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
                     {item.id === 'compare' && comparisonList.length > 0 && (
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentView === 'compare' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                           {comparisonList.length}
                        </span>
                     )}
                  </button>
               ))}
            </nav>
         </div>

         <div className="mt-auto p-6 border-t border-gray-100">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
               <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white flex-shrink-0">
                 <Avatar
                   src={photoUrl}
                   name={name || 'Usuario'}
                   size="medium"
                 />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{name || 'Usuario'}</p>
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
         <div className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 z-10">
            <div className="flex items-center gap-2 text-primary-600">
               <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
               <span className="text-lg font-bold text-gray-900">LinkProp</span>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Avatar
                src={photoUrl}
                name={name || 'Usuario'}
                size="small"
              />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 scroll-smooth">
            <div className={`mx-auto h-full ${currentView === 'explore' || currentView === 'interests' || currentView === 'compare' ? 'max-w-[96%]' : 'max-w-7xl'}`}>
               {renderContent()}
            </div>
         </div>

         {/* Mobile Bottom Nav */}
         <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
         
         {/* Render Unmark Modal at Root Level */}
         <UnmarkConfirmationModal />

         {/* Render Help Modal */}
         {activeHelpModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveHelpModal(null)}></div>
               <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-gray-900">
                        {activeHelpModal === 'faq' ? 'Preguntas Frecuentes' : 'Cómo usar la plataforma'}
                     </h3>
                     <button onClick={() => setActiveHelpModal(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="p-8 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-center text-gray-400 text-sm">
                     Contenido pendiente...
                  </div>
               </div>
            </div>
         )}

      </main>

      {/* Upload Photo Modal */}
      <UploadPhotoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handlePhotoUploadSuccess}
        userId={user?.id || ''}
        userName={name || 'Usuario'}
      />
    </div>
  );
};
