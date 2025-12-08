
import React, { useState, useRef, useEffect } from 'react';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, User, Briefcase,
  Building2, Sparkles, MapPin, DollarSign, PlusCircle, X,
  Check, CheckCircle2, Car, Cat, Camera, ChevronRight, AlertCircle
} from 'lucide-react';
import { UserRole } from '../App';
import { useAuthContext } from '../lib/contexts/AuthContext';
import { MapZoneDrawer } from './MapZoneDrawer';

interface WelcomeProps {
  onLogin: () => void;
}

// CONSTANTS FOR NEIGHBORHOODS (Reused for the modal)
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

const formatNumberWithDots = (value: string): string => {
  if (!value) return '';
  const numericOnly = value.replace(/\D/g, '');
  if (!numericOnly) return '';
  return numericOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumericInput = (value: string): string => {
  return value.replace(/\D/g, '');
};

const handleNumericChange = (value: string, setter: (value: string) => void) => {
  const numericOnly = value.replace(/\D/g, '');
  setter(numericOnly);
};

export const Welcome: React.FC<WelcomeProps> = ({ onLogin }) => {
  const { signIn, signUp } = useAuthContext();
  const [selectedRole, setSelectedRole] = useState<UserRole>('agent');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration state
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

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

      // Step 2: Operation & Property Type
      operationType: '',
      propertyTypes: [] as string[],

      // Step 3: Department Preferences (conditional)
      minFloor: 'Indiferente',
      avenuePreference: 'Indiferente',
      frontPreference: 'Indiferente',
      amenities: [] as string[],

      // Step 5: Location
      region: 'CABA' as 'CABA' | 'GBA',
      neighborhoods: [] as string[],
      geographicZone: null as any,

      // Step 6: Numeric Characteristics
      minPrice: '',
      maxPrice: '',
      minArea: '',
      environments: [] as string[],

      // Step 7: Special Features
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

  const toggleArrayItem = (field: 'propertyTypes' | 'amenities' | 'neighborhoods' | 'environments', item: string) => {
      setRegData(prev => {
          const current = prev[field];
          const isSelected = current.includes(item);

          if (isSelected) {
              return { ...prev, [field]: current.filter(i => i !== item) };
          } else {
              if (field === 'environments' && current.length >= 2) {
                  setRegisterError('Solo puedes seleccionar hasta 2 ambientes');
                  return prev;
              }
              return { ...prev, [field]: [...current, item] };
          }
      });
  };

  const getFilteredNeighborhoods = () => {
      const list = regData.region === 'CABA' ? CABA_NEIGHBORHOODS : GBA_NEIGHBORHOODS;
      if (!hoodSearch) return [];
      return list.filter(h => h.toLowerCase().includes(hoodSearch.toLowerCase()) && !regData.neighborhoods.includes(h)).slice(0, 5);
  };

  const validateCurrentStep = (): boolean => {
      setRegisterError('');

      switch (currentStep) {
        case 1: // Profile
          if (!regData.name.trim()) {
            setRegisterError('Por favor ingresa tu nombre completo');
            return false;
          }
          if (!regData.email.trim()) {
            setRegisterError('Por favor ingresa tu correo electrónico');
            return false;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(regData.email)) {
            setRegisterError('Por favor ingresa un correo electrónico válido');
            return false;
          }
          if (!regData.password || regData.password.length < 6) {
            setRegisterError('La contraseña debe tener al menos 6 caracteres');
            return false;
          }
          return true;

        case 2: // Operation & Property Type
          if (!regData.operationType) {
            setRegisterError('Por favor selecciona un tipo de operación');
            return false;
          }
          if (regData.propertyTypes.length === 0) {
            setRegisterError('Por favor selecciona al menos un tipo de propiedad');
            return false;
          }
          return true;

        case 3: // Department Preferences (always valid, has defaults)
          return true;

        case 4: // Video Tutorial (no validation)
          return true;

        case 5: // Location
          if (regData.region === 'CABA' && !regData.geographicZone && regData.neighborhoods.length === 0) {
            setRegisterError('Por favor dibuja una zona en el mapa o selecciona al menos un barrio');
            return false;
          }
          if (regData.region === 'GBA' && regData.neighborhoods.length === 0) {
            setRegisterError('Por favor selecciona al menos un barrio de interés');
            return false;
          }
          return true;

        case 6: // Numeric Characteristics
          if (!regData.minPrice) {
            setRegisterError('Por favor ingresa el precio mínimo');
            return false;
          }
          if (!regData.maxPrice) {
            setRegisterError('Por favor ingresa el precio máximo');
            return false;
          }
          const minPrice = parseFloat(regData.minPrice);
          const maxPrice = parseFloat(regData.maxPrice);
          if (maxPrice <= minPrice) {
            setRegisterError('El precio máximo debe ser mayor que el precio mínimo');
            return false;
          }
          if (!regData.minArea) {
            setRegisterError('Por favor ingresa los metros cuadrados mínimos');
            return false;
          }
          return true;

        case 7: // Special Features (always valid, optional)
          return true;

        default:
          return true;
      }
  };

  const handleNextStep = () => {
      if (!validateCurrentStep()) {
        return;
      }

      let nextStep = currentStep + 1;

      // Skip step 3 if "Departamento" is not selected
      if (currentStep === 2 && !regData.propertyTypes.includes('Departamento')) {
        nextStep = 4;
      }

      setCurrentStep(nextStep);
  };

  const handlePrevStep = () => {
      let prevStep = currentStep - 1;

      // Skip step 3 when going back if "Departamento" is not selected
      if (currentStep === 4 && !regData.propertyTypes.includes('Departamento')) {
        prevStep = 2;
      }

      setCurrentStep(prevStep);
  };

  const handleFinishRegistration = async () => {
      setRegisterError('');
      setRegisterLoading(true);

      try {
        // Prepare preferences for client
        const preferences = {
          operation_type: regData.operationType,
          property_types: regData.propertyTypes,
          neighborhoods: regData.neighborhoods,
          geographic_zone: regData.geographicZone,
          min_price: regData.minPrice ? parseFloat(regData.minPrice) : null,
          max_price: regData.maxPrice ? parseFloat(regData.maxPrice) : null,
          min_area: regData.minArea ? parseFloat(regData.minArea) : null,
          environments: regData.environments.length > 0 ? regData.environments.join(',') : null,
          amenities: regData.amenities || [],
          min_floor: regData.propertyTypes.includes('Departamento') ? regData.minFloor : null,
          avenue_preference: regData.propertyTypes.includes('Departamento') ? regData.avenuePreference : null,
          front_preference: regData.propertyTypes.includes('Departamento') ? regData.frontPreference : null,
          credit: regData.features.credit,
          professional: regData.features.professional,
          garage: regData.features.garage,
          pets: regData.features.pets,
        };

        await signUp(
          regData.email,
          regData.password,
          'client',
          {
            name: regData.name,
            phone: regData.phone,
            preferences,
          }
        );

        // Reset form
        setRegData({
          name: '',
          email: '',
          password: '',
          phone: '',
          operationType: '',
          propertyTypes: [],
          minFloor: 'Indiferente',
          avenuePreference: 'Indiferente',
          frontPreference: 'Indiferente',
          amenities: [],
          region: 'CABA',
          neighborhoods: [],
          geographicZone: null,
          minPrice: '',
          maxPrice: '',
          minArea: '',
          environments: [],
          features: {
            credit: false,
            professional: false,
            garage: false,
            pets: false
          }
        });
        setCurrentStep(1);
        setIsRegisterOpen(false);
        onLogin();
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.message?.includes('User already registered')) {
          setRegisterError('Este correo electrónico ya está registrado. Intenta iniciar sesión.');
        } else if (error.message?.includes('Password')) {
          setRegisterError('La contraseña debe tener al menos 6 caracteres.');
        } else {
          setRegisterError(error.message || 'Error al crear la cuenta. Intenta nuevamente.');
        }
      } finally {
        setRegisterLoading(false);
      }
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
                        <p className="text-sm text-gray-500 mt-1">Paso {currentStep} de 7</p>
                    </div>
                    <button onClick={() => setIsRegisterOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50/50">
                    {registerError && (
                      <div className="max-w-lg mx-auto mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">{registerError}</p>
                      </div>
                    )}
                    
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
                                <p className="text-sm text-gray-500">Completa con tus datos básicos para comenzar</p>
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
                            </div>
                        </div>
                    )}

                    {/* STEP 2: OPERATION & PROPERTY TYPE */}
                    {currentStep === 2 && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Operación y Tipo de Propiedad</h3>
                                <p className="text-sm text-gray-500">Selecciona el tipo de operación y propiedad que buscas</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                        <Briefcase size={16} className="text-gray-400" /> Tipo de Operación <span className="text-red-500">*</span>
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
                                        <Building2 size={16} className="text-gray-400" /> Tipo de Propiedad <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Departamento', 'Casa', 'PH', 'Terreno', 'Local', 'Quinta', 'Oficina', 'Galpón'].map(type => (
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
                        </div>
                    )}

                    {/* STEP 3: DEPARTMENT PREFERENCES (Conditional) */}
                    {currentStep === 3 && regData.propertyTypes.includes('Departamento') && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Preferencias de Departamento</h3>
                                <p className="text-sm text-gray-500">Características específicas para departamentos</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                        Piso Mínimo
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Indiferente', '1', '2', '3', '4', '5+'].map(floor => (
                                            <button
                                                key={floor}
                                                onClick={() => handleRegChange('minFloor', floor)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                                    regData.minFloor === floor
                                                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {floor}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                        Preferencia Avenida
                                    </label>
                                    <div className="flex gap-2">
                                        {['Indiferente', 'Sí', 'No'].map(pref => (
                                            <button
                                                key={pref}
                                                onClick={() => handleRegChange('avenuePreference', pref)}
                                                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                                    regData.avenuePreference === pref
                                                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {pref}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                        Orientación
                                    </label>
                                    <div className="flex gap-2">
                                        {['Indiferente', 'Frente', 'Contrafrente'].map(orientation => (
                                            <button
                                                key={orientation}
                                                onClick={() => handleRegChange('frontPreference', orientation)}
                                                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                                    regData.frontPreference === orientation
                                                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {orientation}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100/50">
                                    <label className="flex items-center gap-2 mb-3 text-primary-700 font-bold text-sm">
                                        <Sparkles size={16} /> Amenities (Opcional)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Pileta', 'SUM', 'Gimnasio', 'Balcón / Terraza'].map(item => (
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
                            </div>
                        </div>
                    )}

                    {/* STEP 4: VIDEO TUTORIAL */}
                    {currentStep === 4 && (
                        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Cómo Seleccionar la zona que quiero</h3>
                                <p className="text-sm text-gray-500">Mira este breve tutorial para sacar el máximo provecho</p>
                            </div>

                            <div className="aspect-video rounded-xl overflow-hidden relative shadow-2xl">
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    disablePictureInPicture
                                    controlsList="nodownload nofullscreen noremoteplayback"
                                    className="w-full h-full object-cover"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <source src="/bienvenida-tutorial.mp4" type="video/mp4" />
                                    <p className="text-gray-500 text-sm">Tu navegador no soporta la reproducción de videos.</p>
                                </video>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: LOCATION */}
                    {currentStep === 5 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Zona de Interés</h3>
                                <p className="text-sm text-gray-500">Selecciona dónde te gustaría encontrar tu propiedad</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div className="mb-4 bg-gray-50 p-1 rounded-xl flex border border-gray-200 w-fit mx-auto">
                                    {['CABA', 'GBA'].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => handleRegChange('region', r)}
                                            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                                                regData.region === r
                                                ? 'bg-white text-primary-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
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

                                    {regData.region === 'CABA' && (
                                        <MapZoneDrawer
                                            initialZone={regData.geographicZone}
                                            onZoneChange={(zone) => handleRegChange('geographicZone', zone)}
                                            height="350px"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: NUMERIC CHARACTERISTICS */}
                    {currentStep === 6 && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Características Numéricas</h3>
                                <p className="text-sm text-gray-500">Define el rango de precios y características</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                                        <DollarSign size={16} className="text-gray-400" /> Rango de Precios (USD) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input type="text" placeholder="Desde" value={formatNumberWithDots(regData.minPrice)} onChange={e => handleNumericChange(e.target.value, (val) => handleRegChange('minPrice', val))} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50" />
                                        <span className="text-gray-300">-</span>
                                        <input type="text" placeholder="Hasta" value={formatNumberWithDots(regData.maxPrice)} onChange={e => handleNumericChange(e.target.value, (val) => handleRegChange('maxPrice', val))} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Metros Cuadrados Mínimos (m²) <span className="text-red-500">*</span></label>
                                    <input type="number" placeholder="Ej. 50" value={regData.minArea} onChange={e => handleRegChange('minArea', e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white focus:border-primary-300" />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ambientes (Máximo 2)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['1', '2', '3', '4', '5+'].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => toggleArrayItem('environments', val)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                                    regData.environments.includes(val)
                                                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 7: SPECIAL FEATURES */}
                    {currentStep === 7 && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                            <div className="text-center mb-8">
                                <h3 className="text-lg font-bold text-gray-900">Características Especiales</h3>
                                <p className="text-sm text-gray-500">Selecciona características adicionales (Opcional)</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-1 gap-3">
                                    {regData.operationType === 'Venta' ? (
                                        <div onClick={() => handleFeatureToggle('credit')} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${regData.features.credit ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${regData.features.credit ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}><CheckCircle2 size={18}/></div>
                                                <span className={`text-sm font-bold ${regData.features.credit ? 'text-green-800' : 'text-gray-600'}`}>Apto Crédito</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div onClick={() => handleFeatureToggle('pets')} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${regData.features.pets ? 'bg-green-50 border-green-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${regData.features.pets ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}><Cat size={18}/></div>
                                                <span className={`text-sm font-bold ${regData.features.pets ? 'text-green-800' : 'text-gray-600'}`}>Apto Mascotas</span>
                                            </div>
                                        </div>
                                    )}
                                    <div onClick={() => handleFeatureToggle('professional')} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${regData.features.professional ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${regData.features.professional ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}><Briefcase size={18}/></div>
                                            <span className={`text-sm font-bold ${regData.features.professional ? 'text-blue-800' : 'text-gray-600'}`}>Apto Profesional</span>
                                        </div>
                                    </div>
                                    <div onClick={() => handleFeatureToggle('garage')} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${regData.features.garage ? 'bg-orange-50 border-orange-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${regData.features.garage ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}><Car size={18}/></div>
                                            <span className={`text-sm font-bold ${regData.features.garage ? 'text-orange-800' : 'text-gray-600'}`}>Cochera</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-white z-10 flex items-center justify-between gap-6">
                    <button onClick={() => setIsRegisterOpen(false)} className="px-6 py-3 rounded-xl text-gray-500 font-bold text-sm hover:text-gray-900 transition-colors flex-shrink-0">
                        Cancelar
                    </button>

                    <p className="text-xs text-gray-400 leading-relaxed flex-1 text-center px-4">
                       Al continuar, aceptas nuestros <span className="font-bold text-gray-600 cursor-pointer hover:underline">Términos de Servicio</span> y <span className="font-bold text-gray-600 cursor-pointer hover:underline">Política de Privacidad</span>.
                    </p>

                    <div className="flex gap-3 flex-shrink-0">
                        {currentStep > 1 && (
                            <button onClick={handlePrevStep} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                Atrás
                            </button>
                        )}
                        {currentStep < 7 ? (
                            <button onClick={handleNextStep} className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95 flex items-center gap-2">
                                Siguiente <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                              onClick={handleFinishRegistration}
                              disabled={registerLoading}
                              className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {registerLoading ? (
                                  'Creando cuenta...'
                                ) : (
                                  <><Check size={16} /> Finalizar Registro</>
                                )}
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
            src="/imagen-welcome.png"
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

                <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] tracking-tight">
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

            {/* Form Fields (Login) */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const button = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
              if (button) button.click();
            }} className="space-y-5">
               {loginError && (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                   <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                   <p className="text-sm text-red-800">{loginError}</p>
                 </div>
               )}

               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Correo Electrónico</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={20} />
                     <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="tu@email.com"
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
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
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

               {/* Submit Button */}
               <button
                  type="submit"
                  onClick={async (e) => {
                    e.preventDefault();
                    setLoginError('');

                    // Validate fields
                    if (!loginEmail.trim()) {
                      setLoginError('Por favor ingresa tu correo electrónico');
                      return;
                    }

                    if (!loginPassword) {
                      setLoginError('Por favor ingresa tu contraseña');
                      return;
                    }

                    setLoginLoading(true);
                    try {
                      await signIn(loginEmail, loginPassword);
                      onLogin();
                    } catch (error: any) {
                      console.error('Login error:', error);
                      if (error.message?.includes('Invalid login credentials')) {
                        setLoginError('Credenciales inválidas. Verifica tu correo y contraseña.');
                      } else if (error.message?.includes('Email not confirmed')) {
                        setLoginError('Por favor confirma tu correo electrónico antes de iniciar sesión.');
                      } else {
                        setLoginError(error.message || 'Error al iniciar sesión. Intenta nuevamente.');
                      }
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                  disabled={loginLoading}
                  className="group w-full bg-gray-900 hover:bg-black text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-gray-900/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {loginLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  {!loginLoading && <ArrowRight size={20} className="opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />}
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
            </form>

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
