
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, 
  Edit2, 
  Car, CreditCard, LayoutGrid, Briefcase, MapPin, 
  MessageCircle, UserCheck, Clock,
  Home, XCircle, Trash2, Users, ChevronDown, ChevronUp, X, RefreshCcw
} from 'lucide-react';
import { CLIENTS_DATA } from '../constants';

export const Clients: React.FC = () => {
  const [selectedClients, setSelectedClients] = useState<string[]>([]); 
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // 'all' | 'active' | 'inactive'
    type: 'all',
    location: '',
    minBudget: ''
  });

  const toggleSelect = (id: string) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(c => c !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      location: '',
      minBudget: ''
    });
    setSearchTerm('');
  };

  // Filter Logic
  const filteredClients = useMemo(() => {
    return CLIENTS_DATA.filter(client => {
      // 1. Text Search (Name, Email, Location)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        searchTerm === '' ||
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.searchParams.location.toLowerCase().includes(searchLower);

      // 2. Status Filter
      const matchesStatus = filters.status === 'all' || client.status === filters.status;

      // 3. Type Filter
      const matchesType = filters.type === 'all' || client.searchParams.type === filters.type;

      // 4. Location Filter (Specific Field)
      const matchesLocation = filters.location === '' || client.searchParams.location.toLowerCase().includes(filters.location.toLowerCase());

      // 5. Budget Filter (Clients looking for properties UP TO X, so if their maxPrice is >= our filter, they qualify)
      const budgetVal = parseInt(filters.minBudget);
      const matchesBudget = filters.minBudget === '' || client.searchParams.maxPrice >= budgetVal;

      return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesBudget;
    });
  }, [searchTerm, filters]);

  // Stats (Global, not filtered)
  const totalClients = CLIENTS_DATA.length;
  const activeClientsCount = CLIENTS_DATA.filter(c => c.status === 'active').length;
  const inactiveClientsCount = CLIENTS_DATA.filter(c => c.status === 'inactive').length;

  // Unique types for the filter dropdown
  const availableTypes = Array.from(new Set(CLIENTS_DATA.map(c => c.searchParams.type)));

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-24">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cartera de Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona tus leads y oportunidades de venta.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95 flex items-center gap-2">
            <Plus size={18} strokeWidth={2.5} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 rounded-xl bg-blue-50 text-primary-600">
                <Users size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
             </div>
          </div>

          {/* Card 2: Activos */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeClientsCount}</p>
             </div>
          </div>
          
          {/* Card 3: Inactivos */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <XCircle size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clientes Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveClientsCount}</p>
             </div>
          </div>

          {/* Card 4: Nuevos (Mes) - CHANGED */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Clock size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nuevos (Mes)</p>
                <p className="text-2xl font-bold text-gray-900">+5</p>
             </div>
          </div>
      </div>

      {/* Search & Filter Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all">
         
         {/* Top Bar */}
         <div className="p-2 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
               <Search className="text-gray-400" size={20} />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Buscar por nombre, email, teléfono o presupuesto..." 
                 className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm font-medium h-12"
               />
               {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                     <X size={16} />
                  </button>
               )}
            </div>
            
            <div className="h-8 w-px bg-gray-100 hidden md:block"></div>
            
            <div className="flex items-center gap-2 w-full md:w-auto px-2">
               <button 
                 onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                 className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap border ${
                   isFiltersOpen 
                     ? 'bg-primary-50 text-primary-700 border-primary-200' 
                     : 'hover:bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'
                 }`}
               >
                 <Filter size={16} /> 
                 Filtros Avanzados
                 {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
               </button>
               <button className="px-4 py-2 rounded-xl bg-gray-900 text-white font-medium text-sm transition-colors whitespace-nowrap shadow-md shadow-gray-900/10">
                  Buscar
               </button>
            </div>
         </div>

         {/* Advanced Filters Panel */}
         {isFiltersOpen && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
               
               {/* Filter: Status */}
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Estado del Cliente</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-100 outline-none"
                  >
                     <option value="all">Todos los estados</option>
                     <option value="active">Solo Activos</option>
                     <option value="inactive">Solo Inactivos</option>
                  </select>
               </div>

               {/* Filter: Property Type */}
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Tipo de Búsqueda</label>
                  <select 
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-100 outline-none"
                  >
                     <option value="all">Cualquier propiedad</option>
                     {availableTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                     ))}
                  </select>
               </div>

               {/* Filter: Location */}
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Ubicación / Zona</label>
                  <input 
                    type="text" 
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Ej. Palermo, Belgrano..."
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-100 outline-none placeholder:text-gray-400"
                  />
               </div>

               {/* Filter: Budget */}
               <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Presupuesto del Cliente</label>
                   <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={filters.minBudget}
                        onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                        placeholder="Mínimo disponible"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-100 outline-none placeholder:text-gray-400"
                      />
                   </div>
               </div>

               {/* Footer Actions */}
               <div className="md:col-span-4 flex justify-end border-t border-gray-200/50 pt-4 mt-2">
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-red-600 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                     <RefreshCcw size={14} /> Limpiar Filtros
                  </button>
               </div>

            </div>
         )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
         <p className="text-sm font-medium text-gray-500">
            Viendo <span className="font-bold text-gray-900">{filteredClients.length}</span> de {totalClients} clientes
         </p>
      </div>

      {/* Modern List */}
      <div className="space-y-4">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
             <div className="col-span-4">Cliente / Perfil</div>
             <div className="col-span-6">Parámetros de Búsqueda</div>
             <div className="col-span-2 text-right">Acciones</div>
          </div>

          {/* Client Cards */}
          {filteredClients.length > 0 ? (
             filteredClients.map((client) => {
               const isSelected = selectedClients.includes(client.id);

               return (
                 <div 
                    key={client.id} 
                    className={`group relative bg-white rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center
                      ${isSelected ? 'border-primary-300 ring-1 ring-primary-100' : 'border-gray-100 shadow-sm'}
                    `}
                 >
                    {/* Selection Indicator Stripe */}
                    {isSelected && <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary-500 rounded-r-full"></div>}

                    {/* Column 1: Profile & Status */}
                    <div className="md:col-span-4 flex items-center gap-4">
                       <div className="relative flex-shrink-0">
                         <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelect(client.id)}
                            className="absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" 
                         />
                         <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                            <img src={client.avatar} alt="" className="w-full h-full rounded-full object-cover border-2 border-white" />
                         </div>
                       </div>
                       <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className="font-bold text-gray-900 text-base truncate">{client.name}</h3>
                             {/* STATUS BADGE */}
                             {client.status === 'active' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                   Activo
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wide">
                                   Inactivo
                                </span>
                             )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{client.email}</p>
                          <p className="text-[10px] text-gray-400 mt-1">Registrado: {client.date}</p>
                       </div>
                    </div>

                    {/* Column 2: Expanded Search Parameters */}
                    <div className="md:col-span-6">
                       <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                          
                          {/* Main Criteria */}
                          <div className="flex items-center gap-4 flex-1 border-r border-gray-200 pr-4 border-dashed w-full sm:w-auto">
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                                   <Home size={16} className="text-primary-500" />
                                   {client.searchParams.type}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                   <MapPin size={14} />
                                   {client.searchParams.location}
                                </div>
                             </div>
                             <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                             <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Presupuesto</span>
                                <div className="flex items-center gap-1 text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                   {client.searchParams.currency} {client.searchParams.maxPrice.toLocaleString()}
                                </div>
                             </div>
                          </div>

                          {/* Features Grid */}
                          <div className="flex flex-wrap gap-2 justify-end max-w-[220px]">
                             {client.searchParams.environments && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600 shadow-sm" title="Ambientes">
                                   <LayoutGrid size={12} /> {client.searchParams.environments} Amb
                                </span>
                             )}
                             {client.searchParams.hasGarage && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600 shadow-sm" title="Con Cochera">
                                   <Car size={12} /> Cochera
                                </span>
                             )}
                             {client.searchParams.isCreditSuitable && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600 shadow-sm" title="Apto Crédito">
                                   <CreditCard size={12} /> Crédito
                                </span>
                             )}
                             {client.searchParams.isProfessionalSuitable && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600 shadow-sm" title="Apto Profesional">
                                   <Briefcase size={12} /> Prof.
                                </span>
                             )}
                          </div>

                       </div>
                    </div>

                    {/* Column 3: Actions */}
                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                       <button 
                          className="p-2.5 rounded-xl text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-sm hover:shadow-green-200/50 transition-all active:scale-95"
                          title="Contactar por WhatsApp"
                       >
                          <MessageCircle size={18} />
                       </button>
                       <button className="p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all" title="Editar">
                          <Edit2 size={18} />
                       </button>
                       <button className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all" title="Eliminar">
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               )
             })
          ) : (
             <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No se encontraron clientes</h3>
                <p className="text-gray-500 mt-1">Intenta ajustar los filtros o tu búsqueda.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                   Limpiar Filtros
                </button>
             </div>
          )}
      </div>
    </div>
  );
};
