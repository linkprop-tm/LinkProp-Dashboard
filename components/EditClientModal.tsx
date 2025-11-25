
import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, MapPin, DollarSign, 
  Briefcase, Sparkles, Building2, Trash2
} from 'lucide-react';
import { Client, SearchParams } from '../types';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSave: (updatedClient: Client) => void;
  onDelete: () => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ isOpen, onClose, client, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Client>(client);

  // Update local state if the client prop changes
  useEffect(() => {
    setFormData(client);
  }, [client]);

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
  
  // Helper specifically for Property Type to keep it sync with 'type' field if needed, 
  // though we will use the array 'propertyTypes' if possible, or just 'type' as single string 
  // adapted to the chip UI. For this demo, let's treat 'type' as the single source of truth 
  // but allow the UI to look like it could be multiple (though we'll enforce single for 'type' string compatibility).
  const handlePropertyTypeChange = (type: string) => {
      handleSearchParamChange('type', type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          <form id="edit-client-form" onSubmit={handleSubmit} className="space-y-10">
            
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
                        <img 
                        src={formData.avatar} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50"
                        />
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
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all focus:bg-white"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 ml-1">Ubicación / Zona de Interés</label>
                            <div className="relative">
                                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    value={formData.searchParams.location}
                                    onChange={(e) => handleSearchParamChange('location', e.target.value)}
                                    placeholder="Ej. Palermo Soho, Belgrano R, Colegiales..."
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
                                    const isSelected = formData.searchParams.type === type;
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

                  {/* Amenities */}
                  <div className="p-6 bg-blue-50/30 rounded-xl border border-blue-100/50">
                        <label className="flex items-center gap-2 mb-4 text-primary-700 font-bold text-sm">
                            <Sparkles size={16} /> Amenities Deseados
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Pileta', 'SUM', 'Parrilla', 'Gimnasio', 'Seguridad 24hs', 'Lavadero', 'Balcón Terraza'].map(item => {
                                const isSelected = (formData.searchParams.amenities || []).includes(item);
                                return (
                                    <button
                                        type="button"
                                        key={item}
                                        onClick={() => toggleArrayItem('amenities', item)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                            isSelected
                                            ? 'bg-white text-primary-600 border-primary-200 shadow-sm'
                                            : 'bg-white/50 text-gray-500 border-gray-200 hover:bg-white'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                )
                            })}
                        </div>
                  </div>

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

                   <div className="h-px bg-gray-100"></div>

                   {/* Dimensions & Distribution */}
                   <div>
                         <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-6">Dimensiones y Distribución</h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            {/* Area */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-600 block">Metros Cuadrados (m²)</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="number" 
                                        value={formData.searchParams.minArea || ''}
                                        onChange={(e) => handleSearchParamChange('minArea', Number(e.target.value))}
                                        placeholder="Min" 
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center outline-none focus:bg-white focus:border-primary-300 transition-all" 
                                    />
                                    <span className="text-gray-300 self-center">-</span>
                                    <input 
                                        type="number" 
                                        value={formData.searchParams.maxArea || ''}
                                        onChange={(e) => handleSearchParamChange('maxArea', Number(e.target.value))}
                                        placeholder="Max" 
                                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center outline-none focus:bg-white focus:border-primary-300 transition-all" 
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
               </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0 z-10">
          {/* Delete Button (Left) */}
          <button
              type="button"
              onClick={() => {
                  onDelete();
                  onClose();
              }}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
          >
              <Trash2 size={16} /> Eliminar
          </button>

          {/* Right Actions */}
          <div className="flex gap-3">
              <button 
                 type="button"
                 onClick={onClose}
                 className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-white transition-colors"
              >
                 Cancelar
              </button>
              <button 
                 type="submit"
                 form="edit-client-form"
                 className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95"
              >
                 Guardar Cambios
              </button>
          </div>
        </div>

      </div>
    </div>
  );
};
