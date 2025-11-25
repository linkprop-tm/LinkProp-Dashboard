
import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, EyeOff, Mail, Lock, ArrowRight, User, Briefcase, 
  Building2, Sparkles, MapPin, DollarSign, PlusCircle, X,
  Phone, Check, CheckCircle2, Car, Cat, Camera, ChevronRight
} from 'lucide-react';
import { UserRole } from '../App';

interface WelcomeProps {
  onLogin: (role: UserRole) => void;
}

// CONSTANTS FOR NEIGHBORHOODS (Reused for the modal)
const CABA_NEIGHBORHOODS = [
  "Puerto Madero", "Palermo Chico", "Recoleta", "Palermo Botánico", "Las Cañitas", 
  "Palermo Soho", "Palermo Hollywood", "Belgrano", "Núñez", "Colegiales", 
  "Villa Urquiza", "Caballito", "Villa Devoto", "San Telmo"
];

const GBA_NEIGHBORHOODS = [
  "Vicente López", "San Isidro", "Tigre", "Nordelta", "Pilar", "Olivos"
];

export const Welcome: React.FC<WelcomeProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('agent');
  const [showPassword, setShowPassword] = useState(false);

  // --- REGISTRATION STATE ---
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Registration Form Data
  const [regData, setRegData] = useState({
      // Step 1: Profile
      name: '',
      email: '',
      password: '',
      phone: '',
      
      // Step 2: Preferences
      operationType: 'Venta',
      propertyTypes: ['Departamento'] as string[],
      amenities: [] as string[],
      region: 'CABA' as 'CABA' | 'GBA',
      neighborhoods: [] as string[],
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      environments: '',
      bedrooms: '',
      bathrooms: '',
      antiquity: [] as string[],
      features: {
          credit: false,
          professional: false,
          garage: false,
          pets: false
      }
  });

  // Neighborhood Autocomplete State
  const [hoodSearch, setHoodSearch] = useState('');
  const [isHoodDropdownOpen, setIsHoodDropdownOpen] = useState(false);
  const hoodInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoodInputRef.current && !hoodInputRef.current.parentElement?.contains(event.target as Node)) {
        setIsHoodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleRegChange = (field: string, value: any) => {
     setRegData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: keyof typeof regData.features) => {
      setRegData(prev => ({
          ...prev,
          features: {
              ...prev.features,
              [feature]: !prev.features[feature]
          }
      }));
  };

  const toggleArrayItem = (field: 'propertyTypes' | 'amenities' | 'neighborhoods' | 'antiquity', item: string) => {
      setRegData(prev => {
          const current = prev[field];
          const updated = current.includes(item) 
             ? current.filter(i => i !== item) 
             : [...current, item];
          return { ...prev, [field]: updated };
      });
  };

  const getFilteredNeighborhoods = () => {
      const list = regData.region === 'CABA' ? CABA_NEIGHBORHOODS : GBA_NEIGHBORHOODS;
      if (!hoodSearch) return [];
      return list.filter(h => h.toLowerCase().includes(hoodSearch.toLowerCase()) && !regData.neighborhoods.includes(h)).slice(0, 5);
  };

  const handleNextStep = () => {
      setCurrentStep(2);
  };

  const handlePrevStep = () => {
      setCurrentStep(1);
  };

  const handleFinishRegistration = () => {
      // Logic to actually register would go here
      setIsRegisterOpen(false);
      onLogin('client'); // Auto-login as client for demo
  };

  // --- RENDER REGISTRATION MODAL ---
  const renderRegistrationModal = () => {
      if (!isRegisterOpen) return null;

      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsRegisterOpen(false)}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentStep === 1 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>Paso 1: Perfil</span>
                            <ChevronRight size={14} className="text-gray-300"/>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentStep === 2 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>Paso 2: Preferencias</span>
                        </div>
                    </div>
                    <button onClick={() => setIsRegisterOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50/50">
                    
                    {/* STEP 1: PROFILE */}
                    {currentStep === 1 && (
                        <div className="max-w-lg mx-auto space-y-6">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 ring-4 ring-white shadow-sm relative group cursor-pointer overflow-hidden">
                                     <User size={40} />
                                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Camera size={24} className="text-white"/>
                                     </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Tu Información</h3>
                                <p className="text-sm text-gray-500">Completa tus datos básicos para comenzar</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            value={regData.name}
                                            onChange={(e) => handleRegChange('name', e.target.value)}
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="email" 
                                            value={regData.email}
                                            onChange={(e) => handleRegChange('email', e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="password" 
                                            value={regData.password}
                                            onChange={(e) => handleRegChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Celular</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="tel" 
                                            value={regData.phone}
                                            onChange={(e) => handleRegChange('phone', e.target.value)}
                                            placeholder="+54 9 11..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PREFERENCES */}
                    {currentStep === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center mb-2">
                                <h3 className="text-lg font-bold text-gray-900">Preferencias de Búsqueda</h3>
                                <p className="text-sm text-gray-500">Ayúdanos a encontrar tu propiedad ideal</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                                {/* Operation & Type */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                            <Briefcase size={16} className="text-gray-400" /> Tipo de Operación
                                        </label>
                                        <div className="bg-gray-50 p-1.5 rounded-xl flex border border-gray-200">
                                            {['Venta', 'Alquiler'].map(op => (
                                                <button 
                                                    key={op}
                                                    onClick={() => handleRegChange('operationType', op)}
                                                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                                        regData.operationType === op
                                                        ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                                                        : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                                >
                                                    {op}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                            <Building2 size={16} className="text-gray-400" /> Tipo de Propiedad
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Departamento', 'Casa', 'PH', 'Terreno', 'Local', 'Oficina'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => toggleArrayItem('propertyTypes', type)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                                        regData.propertyTypes.includes(type)
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

                                {/* Amenities (Conditional) */}
                                {regData.propertyTypes.includes('Departamento') && (
                                    <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100/50">
                                        <label className="flex items-center gap-2 mb-3 text-primary-700 font-bold text-sm">
                                            <Sparkles size={16} /> Amenities
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Seguridad 24hs', 'Balcón'].map(item => (
                                                <button
                                                    key={item}
                                                    onClick={() => toggleArrayItem('amenities', item)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                        regData.amenities.includes(item)
                                                        ? 'bg-white text-primary-600 border-primary-200 shadow-sm'
                                                        : 'bg-white/50 text-gray-500 border-gray-200 hover:bg-white'
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                <div>
                                     <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                                            <MapPin size={16} className="text-gray-400" /> Zona de Interés
                                        </div>
                                     </div>
                                     <div className="flex gap-4">
                                         <div className="w-1/3 bg-gray-50 p-1 rounded-xl flex border border-gray-200 h-10">
                                            {['CABA', 'GBA'].map(r => (
                                                <button key={r} onClick={() => handleRegChange('region', r)} className={`flex-1 text-xs font-bold rounded-lg ${regData.region === r ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>{r}</button>
                                            ))}
                                         </div>
                                         <div className="relative flex-1 group">
                                            <div className="flex flex-wrap gap-2 absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                                {regData.neighborhoods.map(h => (
                                                    <span key={h} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                                                        {h} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleArrayItem('neighborhoods', h)}/>
                                                    </span>
                                                ))}
                                            </div>
                                            <input 
                                                ref={hoodInputRef}
                                                type="text" 
                                                value={hoodSearch}
                                                onChange={(e) => { setHoodSearch(e.target.value); setIsHoodDropdownOpen(true); }}
                                                onFocus={() => setIsHoodDropdownOpen(true)}
                                                className={`w-full ${regData.neighborhoods.length > 0 ? 'pl-32' : 'pl-4'} pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-50`}
                                                placeholder={regData.neighborhoods.length > 0 ? "" : "Buscar barrios..."}
                                            />
                                            {isHoodDropdownOpen && hoodSearch && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                                                    {getFilteredNeighborhoods().map(h => (
                                                        <button key={h} onClick={() => { toggleArrayItem('neighborhoods', h); setHoodSearch(''); setIsHoodDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between items-center group">
                                                            {h} <PlusCircle size={14} className="opacity-0 group-hover:opacity-100 text-primary-500"/>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                         </div>
                                     </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                        <DollarSign size={16} className="text-gray-400" /> Rango de Precios (USD)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input type="number" placeholder="Min" value={regData.minPrice} onChange={e => handleRegChange('minPrice', e.target.value)} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50" />
                                        <span className="text-gray-300">-</span>
                                        <input type="number" placeholder="Max" value={regData.maxPrice} onChange={e => handleRegChange('maxPrice', e.target.value)} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50" />
                                    </div>
                                </div>
                                
                                <div className="h-px bg-gray-100"></div>

                                {/* Dimensions */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Metros Cuadrados (m²)</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Min" value={regData.minArea} onChange={e => handleRegChange('minArea', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:bg-white focus:border-primary-300" />
                                            <input type="number" placeholder="Max" value={regData.maxArea} onChange={e => handleRegChange('maxArea', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:bg-white focus:border-primary-300" />
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ambientes</label>
                                        <div className="flex gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                            {['1', '2', '3', '4+'].map(val => (
                                                <button key={val} onClick={() => handleRegChange('environments', val)} className={`flex-1 py-1.5 text-xs font-bold rounded ${regData.environments === val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>{val}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Credit */}
                                    <div onClick={() => handleFeatureToggle('credit')} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${regData.features.credit ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${regData.features.credit ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}><CheckCircle2 size={16}/></div>
                                            <span className={`text-xs font-bold ${regData.features.credit ? 'text-green-800' : 'text-gray-600'}`}>Apto Crédito</span>
                                        </div>
                                    </div>
                                    {/* Pets */}
                                    <div onClick={() => handleFeatureToggle('pets')} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${regData.features.pets ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${regData.features.pets ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}><Cat size={16}/></div>
                                            <span className={`text-xs font-bold ${regData.features.pets ? 'text-green-800' : 'text-gray-600'}`}>Apto Mascotas</span>
                                        </div>
                                    </div>
                                    {/* Professional */}
                                    <div onClick={() => handleFeatureToggle('professional')} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${regData.features.professional ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${regData.features.professional ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}><Briefcase size={16}/></div>
                                            <span className={`text-xs font-bold ${regData.features.professional ? 'text-blue-800' : 'text-gray-600'}`}>Apto Profesional</span>
                                        </div>
                                    </div>
                                    {/* Garage */}
                                    <div onClick={() => handleFeatureToggle('garage')} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${regData.features.garage ? 'bg-orange-50 border-orange-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${regData.features.garage ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}><Car size={16}/></div>
                                            <span className={`text-xs font-bold ${regData.features.garage ? 'text-orange-800' : 'text-gray-600'}`}>Cochera</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-between items-center z-10">
                    <button onClick={() => setIsRegisterOpen(false)} className="px-6 py-3 rounded-xl text-gray-500 font-bold text-sm hover:text-gray-900 transition-colors">
                        Cancelar
                    </button>
                    
                    <div className="flex gap-3">
                        {currentStep === 2 && (
                            <button onClick={handlePrevStep} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                Atrás
                            </button>
                        )}
                        {currentStep === 1 ? (
                            <button onClick={handleNextStep} className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95 flex items-center gap-2">
                                Siguiente <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleFinishRegistration} className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95 flex items-center gap-2">
                                <Check size={16} /> Finalizar
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* LEFT SIDE: Immersive Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
         <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2400&auto=format&fit=crop" 
            alt="Karina Poblete" 
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[20s] hover:scale-105"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
         <div className="relative z-10 flex flex-col justify-end w-full p-12 xl:p-20 h-full">
            <div className="space-y-6 mb-10 xl:mb-20">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2 text-white/90 text-sm font-medium mb-4 animate-fade-in-up">
                    <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border border-white" src="https://picsum.photos/50/50?random=1" alt=""/>
                        <img className="w-6 h-6 rounded-full border border-white" src="https://picsum.photos/50/50?random=2" alt=""/>
                        <img className="w-6 h-6 rounded-full border border-white" src="https://picsum.photos/50/50?random=3" alt=""/>
                    </div>
                    <span>+650 Clientes satisfechos</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                   Encontrá tu propiedad<br/>
                   <span className="text-white border-b-4 border-red-500 pb-2 inline-block">con Karina Poblete.</span>
                </h1>
            </div>
         </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
         <div className="w-full max-w-[420px] mx-auto animate-fade-in">
            
            {/* NEW: Mobile/Tablet Intro (Hidden on Desktop) */}
            <div className="lg:hidden mb-10 text-center">
                 <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-gray-600 text-xs font-bold uppercase tracking-wide mb-6">
                    <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://picsum.photos/50/50?random=1" alt=""/>
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://picsum.photos/50/50?random=2" alt=""/>
                        <img className="w-6 h-6 rounded-full border-2 border-white" src="https://picsum.photos/50/50?random=3" alt=""/>
                    </div>
                    <span>+650 Clientes satisfechos</span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-2">
                   Encontrá tu propiedad<br/>
                   <span className="text-gray-900 border-b-4 border-red-500 pb-1 inline-block">con Karina Poblete.</span>
                </h1>
            </div>

            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
               <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Bienvenido</h2>
               <p className="text-gray-500 text-base">Ingresa tus datos para acceder al panel.</p>
            </div>

            {/* Role Selector (Subtle) */}
            <div className="flex p-1 bg-gray-50 rounded-xl mb-8 border border-gray-100">
               <button 
                  onClick={() => setSelectedRole('agent')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedRole === 'agent' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <Briefcase size={16} /> Agente
               </button>
               <button 
                  onClick={() => setSelectedRole('client')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedRole === 'client' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <User size={16} /> Cliente
               </button>
            </div>

            {/* Form Fields (Login) */}
            <div className="space-y-5">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Correo Electrónico</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                     <input 
                        type="email" 
                        value={selectedRole === 'agent' ? 'roberto.diaz@linkprop.com' : 'ana.garcia@gmail.com'}
                        readOnly
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                     <label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Contraseña</label>
                     <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">¿Olvidaste tu contraseña?</button>
                  </div>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                     <input 
                        type={showPassword ? "text" : "password"} 
                        value="password123"
                        readOnly
                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                     />
                     <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                     >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-8">
               <button 
                  onClick={() => onLogin(selectedRole)}
                  className="group w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
               >
                  Iniciar Sesión
                  <ArrowRight size={20} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
               </button>

               <button 
                  onClick={() => {
                      setCurrentStep(1);
                      setIsRegisterOpen(true);
                  }}
                  className="w-full bg-white text-blue-600 border-2 border-blue-50 hover:border-blue-100 hover:bg-blue-50/50 font-bold text-lg py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
               >
                  Registrarse
               </button>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
               Al continuar, aceptas nuestros <span className="font-bold text-gray-600 cursor-pointer hover:underline">Términos de Servicio</span> y <span className="font-bold text-gray-600 cursor-pointer hover:underline">Política de Privacidad</span>.
            </p>
         </div>
      </div>

      {/* RENDER REGISTRATION MODAL */}
      {renderRegistrationModal()}

    </div>
  );
};
