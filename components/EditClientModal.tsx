
import React, { useState, useEffect, useRef } from 'react';
import {
  X, User, Mail, MapPin, DollarSign,
  Briefcase, Sparkles, Building2, Trash2, Loader2, Heart, Eye, CheckCircle,
  Car, Check, Cat, PlusCircle, Map, Ruler
} from 'lucide-react';
import { Client, SearchParams } from '../types';
import { obtenerUsuarioPorId, actualizarUsuario, obtenerRelacionesPorUsuario } from '../lib/api/users';
import { clientToUsuario, usuarioToClient } from '../lib/adapters';
import type { PropiedadUsuario } from '../lib/database.types';
import { NEIGHBORHOODS } from '../lib/neighborhoods';
import { MapZoneDrawer } from './MapZoneDrawer';

// Constants for neighborhoods
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

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSave: (updatedClient: Client) => void;
  onDelete: () => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Client>(client);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activityData, setActivityData] = useState<{
    explorar: number;
    interes: number;
    visitada: number;
    relaciones: any[];
  } | null>(null);

  // Department preferences states
  const [pisoMinimo, setPisoMinimo] = useState<string>('Indiferente');
  const [avenida, setAvenida] = useState<string>('Indiferente');
  const [orientacion, setOrientacion] = useState<string>('Indiferente');

  // Region and neighborhoods states
  const [region, setRegion] = useState<'CABA' | 'GBA'>('CABA');
  const [neighborhoodSearchTerm, setNeighborhoodSearchTerm] = useState('');
  const [isHoodDropdownOpen, setIsHoodDropdownOpen] = useState(false);
  const hoodInputRef = useRef<HTMLInputElement>(null);

  // Number formatting states
  const [priceMinFormatted, setPriceMinFormatted] = useState('');
  const [priceMaxFormatted, setPriceMaxFormatted] = useState('');
  const [m2MinFormatted, setM2MinFormatted] = useState('');

  // Load full user data from database
  useEffect(() => {
    if (isOpen && client.id) {
      loadFullUserData();
    }
  }, [isOpen, client.id]);

  const loadFullUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const usuario = await obtenerUsuarioPorId(client.id);
      if (usuario) {
        const clientData = usuarioToClient(usuario);
        setFormData(clientData);

        // Load department preferences
        setPisoMinimo(clientData.searchParams.pisoMinimo || 'Indiferente');
        setAvenida(clientData.searchParams.avenida || 'Indiferente');
        setOrientacion(clientData.searchParams.orientacion || 'Indiferente');

        // Load region
        setRegion(clientData.searchParams.region || 'CABA');

        // Format numbers
        setPriceMinFormatted(formatNumberWithDots(String(clientData.searchParams.minPrice || '')));
        setPriceMaxFormatted(formatNumberWithDots(String(clientData.searchParams.maxPrice || '')));
        setM2MinFormatted(formatNumberWithDots(String(clientData.searchParams.minArea || '')));
      }

      const relaciones = await obtenerRelacionesPorUsuario(client.id);
      const explorar = relaciones.filter(r => r.etapa === 'Explorar').length;
      const interes = relaciones.filter(r => r.etapa === 'Interes').length;
      const visitada = relaciones.filter(r => r.etapa === 'Visitada').length;

      setActivityData({
        explorar,
        interes,
        visitada,
        relaciones: relaciones.slice(0, 5)
      });
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Error al cargar los datos del usuario');
      setFormData(client);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions for number formatting
  const formatNumberWithDots = (value: string | number): string => {
    if (!value) return '';
    const numericOnly = String(value).replace(/\D/g, '');
    if (!numericOnly) return '';
    return numericOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleNumericChange = (value: string, setter: (value: string) => void, field: keyof SearchParams) => {
    const numericOnly = value.replace(/\D/g, '');
    setter(formatNumberWithDots(numericOnly));
    handleSearchParamChange(field, numericOnly ? Number(numericOnly) : undefined);
  };

  // Helper for neighborhoods
  const getFilteredNeighborhoods = (): string[] => {
    const searchLower = neighborhoodSearchTerm.toLowerCase();
    const neighborhoodsList = region === 'CABA' ? CABA_NEIGHBORHOODS : GBA_NEIGHBORHOODS;
    const currentNeighborhoods = formData.searchParams.neighborhoods || [];

    return neighborhoodsList
      .filter(hood => !currentNeighborhoods.includes(hood))
      .filter(hood => hood.toLowerCase().includes(searchLower));
  };

  // Close neighborhood dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoodInputRef.current && !hoodInputRef.current.contains(event.target as Node)) {
        setIsHoodDropdownOpen(false);
      }
    };

    if (isHoodDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isHoodDropdownOpen]);

  const handleInputChange = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchParamChange = (field: keyof SearchParams, value: any) => {
    setFormData(prev => ({
      ...prev,
      searchParams: {
        ...prev.searchParams,
        [field]: value
      }
    }));
  };

  // Helper for array toggles (Amenities, etc)
  const toggleArrayItem = (field: keyof SearchParams, item: string) => {
     const currentArray = (formData.searchParams[field] as string[]) || [];
     const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
     
     handleSearchParamChange(field, newArray);
  };
  
  // Helper for Operation Type - resets incompatible fields
  const handleOperationTypeChange = (operationType: string) => {
    setFormData(prev => ({
      ...prev,
      searchParams: {
        ...prev.searchParams,
        operationType,
        // Reset incompatible fields
        isCreditSuitable: operationType === 'Venta' ? prev.searchParams.isCreditSuitable : false,
        isPetFriendly: operationType === 'Alquiler' ? prev.searchParams.isPetFriendly : false
      }
    }));
  };

  // Helper for Property Type - supports multiple selection
  const handlePropertyTypeChange = (type: string) => {
      const currentTypes = formData.searchParams.propertyTypes || [];
      let newTypes: string[];

      if (currentTypes.includes(type)) {
          newTypes = currentTypes.filter(t => t !== type);
      } else {
          newTypes = [...currentTypes, type];
      }

      setFormData(prev => ({
          ...prev,
          searchParams: {
              ...prev.searchParams,
              type: newTypes[0] || '',
              propertyTypes: newTypes
          }
      }));
  };

  // Helper for neighborhoods
  const toggleNeighborhood = (neighborhood: string) => {
    const currentNeighborhoods = formData.searchParams.neighborhoods || [];
    let newNeighborhoods: string[];

    if (currentNeighborhoods.includes(neighborhood)) {
      newNeighborhoods = currentNeighborhoods.filter(n => n !== neighborhood);
    } else {
      newNeighborhoods = [...currentNeighborhoods, neighborhood];
    }

    handleSearchParamChange('neighborhoods', newNeighborhoods);
    handleSearchParamChange('location', newNeighborhoods[0] || '');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (formData.searchParams.minPrice && formData.searchParams.maxPrice) {
      if (formData.searchParams.minPrice > formData.searchParams.maxPrice) {
        errors.price = 'El precio mínimo no puede ser mayor que el máximo';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler for ambientes - allows selecting up to 2 values
  const toggleAmbientes = (val: string) => {
    const currentAmbientes = Array.isArray(formData.searchParams.environments)
      ? formData.searchParams.environments
      : (formData.searchParams.environments ? [String(formData.searchParams.environments)] : []);

    let newAmbientes: string[];

    if (currentAmbientes.includes(val)) {
      newAmbientes = currentAmbientes.filter(v => v !== val);
    } else {
      if (currentAmbientes.length >= 2) {
        // Remove first and add new
        newAmbientes = [currentAmbientes[1], val];
      } else {
        newAmbientes = [...currentAmbientes, val];
      }
    }

    handleSearchParamChange('environments', newAmbientes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update formData with department preferences and region before saving
      const updatedFormData = {
        ...formData,
        searchParams: {
          ...formData.searchParams,
          pisoMinimo,
          avenida,
          orientacion,
          region
        }
      };

      const updateData = clientToUsuario(updatedFormData);
      const updatedUsuario = await actualizarUsuario({
        id: formData.id,
        ...updateData
      });

      const updatedClient = usuarioToClient(updatedUsuario);
      onSave(updatedClient);
      onClose();
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Error al guardar los cambios. Por favor, intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
            <p className="text-xs text-gray-400">Modifica el perfil y preferencias de búsqueda</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Cargando datos del usuario...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="text-red-600" size={18} />
                  </div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {validationErrors.price && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <X className="text-amber-600" size={18} />
                  </div>
                  <p className="text-sm text-amber-700 font-medium">{validationErrors.price}</p>
                </div>
              )}

              <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-10">

                {/* Activity Stats Section */}
                {activityData && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Eye className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase">Explorando</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.explorar}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Heart className="text-amber-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-600 uppercase">Interés</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.interes}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle className="text-emerald-600" size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase">Visitadas</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.visitada}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 1: Personal Info & Status */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} className="text-primary-600" /> Información Personal
                    </h3>
                    
                    {/* Status Toggle */}
                    <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-200">
                        <button
                            type="button"
                            onClick={() => handleInputChange('status', 'active')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                formData.status === 'active' 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${formData.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            Activo
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInputChange('status', 'inactive')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                formData.status === 'inactive' 
                                ? 'bg-white text-gray-500 shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${formData.status === 'inactive' ? 'bg-gray-500' : 'bg-gray-300'}`} />
                            Inactivo
                        </button>
                    </div>
                </div>
              
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-24 h-24 rounded-full ring-4 ring-gray-50 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                          {formData.avatar ? (
                            <img
                              src={formData.avatar}
                              alt="Avatar"
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          ) : (
                            formData.name?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1">Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all focus:bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all focus:bg-white ${validationErrors.email ? 'border-red-300' : 'border-gray-200'}`}
                                />
                                {validationErrors.email && (
                                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Search Preferences (Updated Design) */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Preferencias de Búsqueda</h3>
                    <p className="text-gray-500 text-sm mt-1">Personaliza qué tipo de propiedades te interesan.</p>
                </div>
               
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                  
                  {/* Row 1: Operation & Property Type */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      
                      {/* Operation Type */}
                      <div>
                          <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                              <Briefcase size={16} className="text-gray-400" /> Tipo de Operación
                          </label>
                          <div className="bg-gray-50 p-1.5 rounded-xl flex border border-gray-200">
                                {['Venta', 'Alquiler'].map(op => {
                                    const isSelected = (formData.searchParams.operationType || 'Venta') === op;
                                    return (
                                        <button
                                            type="button"
                                            key={op}
                                            onClick={() => handleOperationTypeChange(op)}
                                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                                isSelected
                                                ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                                                : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                        >
                                            {op}
                                        </button>
                                    )
                                })}
                           </div>
                      </div>

                      {/* Property Type */}
                      <div>
                          <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                              <Building2 size={16} className="text-gray-400" /> Tipo de Propiedad
                          </label>
                          <div className="flex flex-wrap gap-2">
                                {['Departamento', 'Casa', 'PH', 'Terreno', 'Local', 'Oficina', 'Galpón'].map(type => {
                                    const isSelected = (formData.searchParams.propertyTypes || []).includes(type);
                                    return (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => handlePropertyTypeChange(type)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                                isSelected
                                                ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    )
                                })}
                           </div>
                      </div>
                  </div>

                  {/* Department Preferences - Solo para Departamento */}
                  {(formData.searchParams.propertyTypes?.includes('Departamento') || formData.searchParams.type === 'Departamento') && (
                    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 size={20} className="text-blue-600" />
                            <h3 className="text-base font-bold text-gray-900">Preferencias de Departamento</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Piso Mínimo */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 block">Piso Mínimo</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Indiferente', '1', '2', '3', '4', '5+'].map(piso => (
                                        <button
                                            key={piso}
                                            type="button"
                                            onClick={() => setPisoMinimo(piso)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                                pisoMinimo === piso
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            {piso}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Avenida */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 block">Preferencia de Avenida</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Indiferente', 'Sí', 'No'].map(av => (
                                        <button
                                            key={av}
                                            type="button"
                                            onClick={() => setAvenida(av)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                                avenida === av
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            {av}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orientación */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 block">Orientación</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Indiferente', 'Frente', 'Contrafrente'].map(or => (
                                        <button
                                            key={or}
                                            type="button"
                                            onClick={() => setOrientacion(or)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                                orientacion === or
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            {or}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {/* Amenities - Solo para Departamento */}
                  {(formData.searchParams.propertyTypes?.includes('Departamento') || formData.searchParams.type === 'Departamento') && (
                    <div className="p-6 bg-white rounded-xl border border-primary-100 shadow-[0_0_15px_rgba(37,99,235,0.05)]">
                          <label className="flex items-center gap-2 mb-4 text-primary-700 font-bold text-sm">
                              <Sparkles size={16} /> Amenities Deseados
                          </label>
                          <div className="flex flex-wrap gap-2">
                              {['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Lavadero', 'Balcón Terraza'].map(item => {
                                  const isSelected = (formData.searchParams.amenities || []).includes(item);
                                  return (
                                      <button
                                          type="button"
                                          key={item}
                                          onClick={() => toggleArrayItem('amenities', item)}
                                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                              isSelected
                                              ? 'bg-white text-primary-600 border-primary-200 shadow-sm'
                                              : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                                          }`}
                                      >
                                          {item}
                                      </button>
                                  )
                              })}
                          </div>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                        <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                            <DollarSign size={16} className="text-gray-400" /> Rango de Precios (USD)
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Desde</span>
                                <input
                                    type="text"
                                    value={priceMinFormatted}
                                    onChange={(e) => handleNumericChange(e.target.value, setPriceMinFormatted, 'minPrice')}
                                    placeholder="0"
                                    className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all"
                                />
                            </div>
                            <span className="text-gray-300 font-medium">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Hasta</span>
                                <input
                                    type="text"
                                    value={priceMaxFormatted}
                                    onChange={(e) => handleNumericChange(e.target.value, setPriceMaxFormatted, 'maxPrice')}
                                    placeholder="Sin límite"
                                    className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all"
                                />
                            </div>
                        </div>
                   </div>

                   <div className="h-px bg-gray-100"></div>

                   {/* Dimensions & Distribution */}
                   <div>
                         <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6">Dimensiones y Distribución</h3>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            {/* Area */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-600 block">Metros Cuadrados (m²)</label>
                                <div className="relative flex items-center gap-2">
                                    <Ruler size={16} className="text-gray-400" />
                                    <input
                                        type="text"
                                        value={m2MinFormatted}
                                        onChange={(e) => handleNumericChange(e.target.value, setM2MinFormatted, 'minArea')}
                                        placeholder="Ej: 50"
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center outline-none focus:bg-white focus:border-primary-300 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Ambientes */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-600 block">Ambientes (Elegi Minimo y Maximo)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['1', '2', '3', '4', '5+'].map(val => {
                                        const currentAmbientes = Array.isArray(formData.searchParams.environments)
                                          ? formData.searchParams.environments
                                          : (formData.searchParams.environments ? [String(formData.searchParams.environments)] : []);
                                        const isSelected = currentAmbientes.includes(val);
                                        return (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => toggleAmbientes(val)}
                                                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all focus:outline-none ${
                                                    isSelected
                                                    ? 'bg-primary-600 text-white shadow-sm'
                                                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                                                }`}
                                            >{val}</button>
                                        )
                                    })}
                                </div>
                                {Array.isArray(formData.searchParams.environments) && formData.searchParams.environments.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Seleccionados: {formData.searchParams.environments.sort().join(' - ')}
                                    </p>
                                )}
                            </div>

                         </div>
                   </div>

                   <div className="h-px bg-gray-100"></div>

                   {/* Características Específicas */}
                   <div>
                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6">Características Específicas</h3>

                        <div className="space-y-6">
                            {/* Antigüedad */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Antigüedad</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Indiferente', 'Pozo / Construcción', 'A estrenar', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años', 'Hasta 50 años'].map(val => {
                                        const currentAntiquity = Array.isArray(formData.searchParams.antiquity)
                                          ? formData.searchParams.antiquity[0]
                                          : formData.searchParams.antiquity || 'Indiferente';
                                        const isSelected = currentAntiquity === val;
                                        return (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => handleSearchParamChange('antiquity', val)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                                    isSelected
                                                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {val}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Aptitudes - Condicionales según tipo de operación */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Apto Crédito (solo para Venta) / Apto Mascotas (solo para Alquiler) */}
                                {formData.searchParams.operationType === 'Venta' ? (
                                    <div
                                        onClick={() => handleSearchParamChange('isCreditSuitable', !formData.searchParams.isCreditSuitable)}
                                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                            formData.searchParams.isCreditSuitable
                                            ? 'bg-green-50 border-green-200 shadow-sm'
                                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                formData.searchParams.isCreditSuitable ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'
                                            }`}>
                                                <CheckCircle size={16} strokeWidth={2.5} />
                                            </div>
                                            <span className={`text-sm font-bold ${
                                                formData.searchParams.isCreditSuitable ? 'text-green-800' : 'text-gray-700'
                                            }`}>Apto Crédito</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.searchParams.isCreditSuitable ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white'
                                        }`}>
                                            {formData.searchParams.isCreditSuitable && <Check size={14} strokeWidth={3}/>}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => handleSearchParamChange('isPetFriendly', !formData.searchParams.isPetFriendly)}
                                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                            formData.searchParams.isPetFriendly
                                            ? 'bg-green-50 border-green-200 shadow-sm'
                                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                                formData.searchParams.isPetFriendly ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'
                                            }`}>
                                                <Cat size={16} strokeWidth={2.5} />
                                            </div>
                                            <span className={`text-sm font-bold ${
                                                formData.searchParams.isPetFriendly ? 'text-green-800' : 'text-gray-700'
                                            }`}>Apto Mascotas</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                            formData.searchParams.isPetFriendly ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white'
                                        }`}>
                                            {formData.searchParams.isPetFriendly && <Check size={14} strokeWidth={3}/>}
                                        </div>
                                    </div>
                                )}

                                {/* Apto Profesional */}
                                <div
                                    onClick={() => handleSearchParamChange('isProfessionalSuitable', !formData.searchParams.isProfessionalSuitable)}
                                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                        formData.searchParams.isProfessionalSuitable
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                                    }`}
                                >
                                     <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                            formData.searchParams.isProfessionalSuitable ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            <Briefcase size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-sm font-bold ${
                                            formData.searchParams.isProfessionalSuitable ? 'text-blue-800' : 'text-gray-700'
                                        }`}>Apto Profesional</span>
                                     </div>
                                     <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                         formData.searchParams.isProfessionalSuitable ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 bg-white'
                                     }`}>
                                         {formData.searchParams.isProfessionalSuitable && <Check size={14} strokeWidth={3}/>}
                                     </div>
                                </div>

                                {/* Cochera */}
                                <div
                                    onClick={() => handleSearchParamChange('hasGarage', !formData.searchParams.hasGarage)}
                                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all group select-none ${
                                        formData.searchParams.hasGarage
                                        ? 'bg-orange-50 border-orange-200 shadow-sm'
                                        : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                            formData.searchParams.hasGarage ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            <Car size={16} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-sm font-bold ${
                                            formData.searchParams.hasGarage ? 'text-orange-800' : 'text-gray-700'
                                        }`}>Cochera</span>
                                    </div>
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                        formData.searchParams.hasGarage ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 bg-white'
                                    }`}>
                                         {formData.searchParams.hasGarage && <Check size={14} strokeWidth={3}/>}
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación / Barrios */}
                            <div className="md:col-span-3">
                                <label className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-sm">
                                    <MapPin size={16} className="text-gray-400" /> Barrios de Preferencia
                                </label>

                                {/* Region Toggle */}
                                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl mb-4 border border-gray-200 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setRegion('CABA')}
                                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                                            region === 'CABA'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        CABA
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRegion('GBA')}
                                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                                            region === 'GBA'
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        GBA / Provincia
                                    </button>
                                </div>

                                {/* Selected Neighborhoods Tags */}
                                {formData.searchParams.neighborhoods && formData.searchParams.neighborhoods.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        {formData.searchParams.neighborhoods.map((hood) => (
                                            <span
                                                key={hood}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-lg"
                                            >
                                                {hood}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleNeighborhood(hood)}
                                                    className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Neighborhood Search Input */}
                                <div className="relative" ref={hoodInputRef}>
                                    <input
                                        type="text"
                                        value={neighborhoodSearchTerm}
                                        onChange={(e) => {
                                            setNeighborhoodSearchTerm(e.target.value);
                                            setIsHoodDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsHoodDropdownOpen(true)}
                                        placeholder={`Buscar barrios en ${region === 'CABA' ? 'CABA' : 'GBA'}...`}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all"
                                    />

                                    {/* Dropdown */}
                                    {isHoodDropdownOpen && getFilteredNeighborhoods().length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {getFilteredNeighborhoods().map((hood) => (
                                                <button
                                                    key={hood}
                                                    type="button"
                                                    onClick={() => {
                                                        toggleNeighborhood(hood);
                                                        setNeighborhoodSearchTerm('');
                                                        setIsHoodDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                                >
                                                    {hood}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Map - Only for CABA */}
                                {region === 'CABA' && (
                                    <div className="mt-6">
                                        <label className="flex items-center gap-2 mb-3 text-gray-700 font-medium text-sm">
                                            <Map size={16} className="text-primary-600" /> También dibuja tu zona de interés en el mapa
                                        </label>
                                        <MapZoneDrawer
                                            initialZone={formData.searchParams.geographicZone}
                                            onZoneChange={(zone) => handleSearchParamChange('geographicZone', zone)}
                                            height="400px"
                                        />
                                        <p className="text-xs text-gray-500 mt-3">
                                            Dibuja un polígono en el mapa para definir la zona de preferencia del cliente
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                   </div>
               </div>
            </div>

          </form>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && (
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0 z-10">
            {/* Delete Button (Left) */}
            <button
                type="button"
                onClick={() => {
                    onDelete();
                    onClose();
                }}
                disabled={saving}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 size={16} /> Eliminar
            </button>

            {/* Right Actions */}
            <div className="flex gap-3">
                <button
                   type="button"
                   onClick={onClose}
                   disabled={saving}
                   className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   Cancelar
                </button>
                <button
                   type="submit"
                   form="edit-client-form"
                   disabled={saving}
                   className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                   {saving ? (
                     <>
                       <Loader2 className="w-4 h-4 animate-spin" />
                       Guardando...
                     </>
                   ) : (
                     'Guardar Cambios'
                   )}
                </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
