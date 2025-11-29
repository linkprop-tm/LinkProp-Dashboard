
import React, { useState, useEffect } from 'react';
import {
  X, User, Mail, MapPin, DollarSign,
  Briefcase, Sparkles, Building2, Trash2, Phone, Loader2, Heart, Eye, CheckCircle,
  Car, Check, Cat
} from 'lucide-react';
import { Client, SearchParams } from '../types';
import { obtenerUsuarioPorId, actualizarUsuario, obtenerRelacionesPorUsuario } from '../lib/api/users';
import { clientToUsuario, usuarioToClient } from '../lib/adapters';
import type { PropiedadUsuario } from '../lib/database.types';

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
        setFormData(usuarioToClient(usuario));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = clientToUsuario(formData);
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
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="Ej. +54 11 1234-5678"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all focus:bg-white"
                                />
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
                                            onClick={() => handleSearchParamChange('operationType', op)}
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
                                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
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
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Min</span>
                                <input 
                                    type="number" 
                                    value={formData.searchParams.minPrice || ''}
                                    onChange={(e) => handleSearchParamChange('minPrice', Number(e.target.value))}
                                    placeholder="0" 
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all" 
                                />
                            </div>
                            <span className="text-gray-300 font-medium">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">Max</span>
                                <input 
                                    type="number" 
                                    value={formData.searchParams.maxPrice || ''}
                                    onChange={(e) => handleSearchParamChange('maxPrice', Number(e.target.value))}
                                    placeholder="Sin límite" 
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-50 transition-all" 
                                />
                            </div>
                        </div>
                   </div>

                   {/* Ubicación / Barrios */}
                   <div>
                        <label className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-sm">
                            <MapPin size={16} className="text-gray-400" /> Ubicación / Barrios de Preferencia
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.searchParams.location}
                                onChange={(e) => handleSearchParamChange('location', e.target.value)}
                                placeholder="Ej. Palermo, Belgrano, Recoleta..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all focus:bg-white"
                            />
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
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.searchParams.minArea || ''}
                                        onChange={(e) => handleSearchParamChange('minArea', Number(e.target.value))}
                                        placeholder="Min"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center outline-none focus:bg-white focus:border-primary-300 transition-all"
                                    />
                                </div>
                            </div>
                            
                            {/* Ambientes */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-600 block">Ambientes</label>
                                <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                                    {['1', '2', '3', '4', '5+'].map(val => {
                                        const isSelected = formData.searchParams.environments == val;
                                        return (
                                            <button 
                                                key={val}
                                                type="button"
                                                onClick={() => handleSearchParamChange('environments', val)}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all focus:outline-none ${
                                                    isSelected 
                                                    ? 'bg-white text-gray-900 shadow-sm' 
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                                }`}
                                            >{val}</button>
                                        )
                                    })}
                                </div>
                            </div>

                             {/* Dormitorios */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-600 block">Dormitorios</label>
                                <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                                    {['1', '2', '3', '4', '5+'].map(val => {
                                        const isSelected = formData.searchParams.bedrooms == val;
                                        return (
                                            <button 
                                                key={val}
                                                type="button"
                                                onClick={() => handleSearchParamChange('bedrooms', val)}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all focus:outline-none ${
                                                    isSelected 
                                                    ? 'bg-white text-gray-900 shadow-sm' 
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                                }`}
                                            >{val}</button>
                                        )
                                    })}
                                </div>
                            </div>

                             {/* Baños */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-600 block">Baños</label>
                                <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                                    {['1', '2', '3', '4+'].map(val => {
                                         const isSelected = formData.searchParams.bathrooms == val;
                                         return (
                                            <button 
                                                key={val}
                                                type="button"
                                                onClick={() => handleSearchParamChange('bathrooms', val)}
                                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all focus:outline-none ${
                                                    isSelected 
                                                    ? 'bg-white text-gray-900 shadow-sm' 
                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                                }`}
                                            >{val}</button>
                                        )
                                    })}
                                </div>
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
                                    {['Indiferente', 'Hasta 5 años', 'Hasta 10 años', 'Hasta 20 años', 'Más de 20 años'].map(val => {
                                        const isSelected = (formData.searchParams.antiquity || []).includes(val);
                                        return (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => toggleArrayItem('antiquity', val)}
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
