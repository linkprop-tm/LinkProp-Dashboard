
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Filter, Plus,
  Edit2,
  Car, CreditCard, LayoutGrid, Briefcase, MapPin,
  UserCheck, Clock,
  Home, XCircle, Trash2, Users, ChevronDown, ChevronUp, X, RefreshCcw, DollarSign,
  AlertTriangle, Activity, Zap, Heart, ArrowUpDown, Calendar, ArrowDown, ArrowUp, Cat
} from 'lucide-react';
import { EditClientModal } from './EditClientModal';
import { Client } from '../types';
import { obtenerUsuarios, eliminarUsuario } from '../lib/api/users';
import { usuarioToClient } from '../lib/adapters';
import { matchesNeighborhood } from '../lib/neighborhoods';

// Helper to format neighborhoods display
const formatNeighborhoods = (neighborhoods?: string[], location?: string): string => {
  const barrios = neighborhoods && neighborhoods.length > 0 ? neighborhoods : (location ? [location] : []);
  if (barrios.length === 0) return '';
  if (barrios.length === 1) return barrios[0];
  return barrios.join(' o ');
};

// Helper to parse dates like "06 Ene, 2025"
const parseClientDate = (dateStr: string) => {
  const months: {[key: string]: number} = {
    'Ene': 0, 'Feb': 1, 'Mar': 2, 'Abr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dic': 11
  };
  try {
    // Remove comma and split
    const parts = dateStr.replace(',', '').split(' ');
    if (parts.length < 3) return 0;

    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day).getTime();
  } catch (e) {
    return 0;
  }
};

type SortOption = 'newest' | 'oldest' | 'interests' | 'budget';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const usuarios = await obtenerUsuarios();
      const mappedClients: Client[] = usuarios.map(usuario => usuarioToClient(usuario));
      setClients(mappedClients);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Sort State
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Edit Modal State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Delete Modal State
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // 'all' | 'active' | 'inactive'
    type: 'all',
    location: '',
    minBudget: ''
  });

  // Close sort menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setSortOption('newest');
  };

  // Handler for saving edits from the modal
  const handleSaveClient = (updatedClient: Client) => {
    setClients(prevClients => 
      prevClients.map(c => c.id === updatedClient.id ? updatedClient : c)
    );
    setEditingClient(null);
  };

  // Handler for Deleting
  const handleDeleteClick = (id: string) => {
    setClientToDelete(id);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      const clientId = clientToDelete;

      setClients(prevClients => prevClients.filter(c => c.id !== clientId));
      setClientToDelete(null);

      eliminarUsuario(clientId).catch(err => {
        console.error('Error deleting client in background:', err);
      });
    }
  };

  // Filter & Sort Logic
  const processedClients = useMemo(() => {
    // 1. Filter
    let result = clients.filter(client => {
      // Text Search (Name, Email, Location)
      const searchLower = searchTerm.toLowerCase();
      const neighborhoodsToSearch = client.searchParams.neighborhoods || [client.searchParams.location];
      const locationMatch = neighborhoodsToSearch.length > 0
        ? matchesNeighborhood(searchLower, neighborhoodsToSearch)
        : true;

      const matchesSearch =
        searchTerm === '' ||
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        locationMatch;

      // Status Filter
      const matchesStatus = filters.status === 'all' || client.status === filters.status;

      // Type Filter
      const matchesType = filters.type === 'all' || client.searchParams.type === filters.type;

      // Location Filter (Specific Field)
      const neighborhoodsToFilter = client.searchParams.neighborhoods || [client.searchParams.location];
      const matchesLocation = filters.location === '' || matchesNeighborhood(filters.location, neighborhoodsToFilter);

      // Budget Filter (Clients looking for properties UP TO X, so if their maxPrice is >= our filter, they qualify)
      const budgetVal = parseInt(filters.minBudget);
      const matchesBudget = filters.minBudget === '' || client.searchParams.maxPrice >= budgetVal;

      return matchesSearch && matchesStatus && matchesType && matchesLocation && matchesBudget;
    });

    // 2. Sort
    return result.sort((a, b) => {
        switch (sortOption) {
            case 'newest':
                return parseClientDate(b.date) - parseClientDate(a.date);
            case 'oldest':
                return parseClientDate(a.date) - parseClientDate(b.date);
            case 'interests':
                // Assuming activityScore correlates with interests/engagement
                return b.activityScore - a.activityScore;
            case 'budget':
                return b.searchParams.maxPrice - a.searchParams.maxPrice;
            default:
                return 0;
        }
    });

  }, [searchTerm, filters, clients, sortOption]);

  // Stats (Global, not filtered)
  const totalClients = clients.length;
  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const inactiveClientsCount = clients.filter(c => c.status === 'inactive').length;

  // Unique types for the filter dropdown
  const availableTypes = Array.from(new Set(clients.map(c => c.searchParams.type)));

  // --- DELETE CONFIRMATION MODAL ---
  const DeleteConfirmationModal = () => {
    if (!clientToDelete) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setClientToDelete(null)}
        />
        
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10 animate-fade-in-up transform scale-100 origin-center">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 ring-4 ring-red-50/50">
                    <Trash2 size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Cliente?</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                   Esta acción eliminará al cliente y todo su historial de actividad de forma permanente.
                </p>

                <div className="flex gap-3 w-full">
                   <button 
                     onClick={() => setClientToDelete(null)}
                     className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                   >
                      Cancelar
                   </button>
                   <button 
                     onClick={confirmDelete}
                     className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                   >
                      Eliminar
                   </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const getSortLabel = () => {
      switch(sortOption) {
          case 'newest': return 'Mas nuevos';
          case 'oldest': return 'Mas antiguos';
          case 'interests': return 'Mayores intereses';
          case 'budget': return 'Mayor presupuesto';
          default: return 'Ordenar';
      }
  };

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

          {/* Card 4: Nuevos (Mes) */}
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
               
               {/* Sort Dropdown */}
               <div className="relative" ref={sortMenuRef}>
                   <button 
                     onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                     className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-all shadow-md shadow-gray-900/10 whitespace-nowrap active:scale-95"
                   >
                      <ArrowUpDown size={16} />
                      {getSortLabel()}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
                   </button>

                   {isSortMenuOpen && (
                       <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-up">
                           <div className="p-1.5 space-y-0.5">
                               <button 
                                 onClick={() => { setSortOption('newest'); setIsSortMenuOpen(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${sortOption === 'newest' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                               >
                                   <Calendar size={16} className="text-gray-400" /> Mas nuevos
                               </button>
                               <button 
                                 onClick={() => { setSortOption('oldest'); setIsSortMenuOpen(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${sortOption === 'oldest' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                               >
                                   <Clock size={16} className="text-gray-400" /> Mas antiguos
                               </button>
                               <div className="h-px bg-gray-100 my-1"></div>
                               <button 
                                 onClick={() => { setSortOption('interests'); setIsSortMenuOpen(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${sortOption === 'interests' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                               >
                                   <Heart size={16} className="text-gray-400" /> Mayores intereses
                               </button>
                               <button 
                                 onClick={() => { setSortOption('budget'); setIsSortMenuOpen(false); }}
                                 className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${sortOption === 'budget' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
                               >
                                   <DollarSign size={16} className="text-gray-400" /> Mayor presupuesto
                               </button>
                           </div>
                       </div>
                   )}
               </div>
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
                     <option value="all">Todos los tipos</option>
                     {availableTypes.map(type => (
                       <option key={type} value={type}>{type}</option>
                     ))}
                  </select>
               </div>

               {/* Filter: Location (Text) */}
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Ubicación</label>
                  <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder="Ej: Palermo"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-100 outline-none"
                      />
                  </div>
               </div>

               {/* Filter: Min Budget */}
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Presupuesto Min.</label>
                  <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="number"
                        value={filters.minBudget}
                        onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-100 outline-none"
                      />
                  </div>
               </div>

               <div className="md:col-span-4 flex justify-end">
                   <button 
                     onClick={clearFilters}
                     className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                   >
                     <RefreshCcw size={14} /> Limpiar Filtros
                   </button>
               </div>

            </div>
         )}
      </div>

      {/* Grid of Clients */}
      {processedClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                <Search size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron clientes</h3>
            <p className="text-gray-500 max-w-md mx-auto text-center mb-6">
               No hay resultados que coincidan con tu búsqueda. Intenta ajustar los filtros.
            </p>
            <button 
               onClick={clearFilters}
               className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg transition-colors text-sm"
            >
               Limpiar Filtros
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {processedClients.map(client => {
                // Simulated metrics for display based on activity score
                const matchesCount = Math.max(1, Math.floor(client.activityScore * 0.8));
                const interestsCount = Math.max(0, Math.floor(client.activityScore * 0.3));

                return (
                <div key={client.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group flex flex-col overflow-hidden">
                    
                    {/* Header: User Info */}
                    <div className="p-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full ring-4 ring-gray-50 group-hover:ring-primary-50 transition-all bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold">
                                      {client.avatar ? (
                                        <img src={client.avatar} alt={client.name || 'Usuario'} className="w-14 h-14 rounded-full object-cover" />
                                      ) : (
                                        client.name?.charAt(0)?.toUpperCase() || '?'
                                      )}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors cursor-pointer" onClick={() => setEditingClient(client)}>
                                       {client.name || 'Usuario sin nombre'}
                                    </h3>
                                    <p className="text-xs font-medium text-gray-400 mt-0.5">{client.email || 'Sin email'}</p>
                                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">
                                        Registrado: {client.date}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Replaced Edit Button with Stats Badges */}
                            <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-1.5 bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm border border-violet-100">
                                    <Zap size={10} className="fill-violet-700" />
                                    {matchesCount} Matches
                                </div>
                                <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm border border-rose-100">
                                    <Heart size={10} className="fill-rose-600" />
                                    {interestsCount} Intereses
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-50 mx-6"></div>

                    {/* Search Params Summary */}
                    <div className="p-6 space-y-4 flex-1">
                         {/* Location & Type */}
                         <div className="flex flex-col gap-2">
                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 w-fit ${client.searchParams.operationType === 'Alquiler' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {client.searchParams.operationType || 'Venta'}
                             </span>
                             <p className="text-sm font-bold text-gray-700 leading-tight">
                                {client.searchParams.type} en {formatNeighborhoods(client.searchParams.neighborhoods, client.searchParams.location)}
                             </p>
                         </div>

                         {/* Budget */}
                         <div className="flex items-start gap-3">
                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                                 <DollarSign size={16} />
                             </div>
                             <div>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Presupuesto Máx</p>
                                 <p className="text-sm font-bold text-gray-700 leading-tight">
                                     {client.searchParams.currency} {client.searchParams.maxPrice.toLocaleString()}
                                 </p>
                             </div>
                         </div>

                         {/* Requirements Tags */}
                         <div className="grid grid-cols-2 gap-2 pt-2">
                             {[
                                 {
                                     label: `${client.searchParams.environments} ambientes`,
                                     icon: LayoutGrid,
                                     bgColor: 'bg-gray-50',
                                     textColor: 'text-gray-500',
                                     borderColor: 'border-gray-100',
                                     show: true
                                 },
                                 {
                                     label: 'Cochera',
                                     icon: Car,
                                     bgColor: 'bg-orange-50',
                                     textColor: 'text-orange-600',
                                     borderColor: 'border-orange-100',
                                     show: client.searchParams.hasGarage
                                 },
                                 {
                                     label: 'Apto Crédito',
                                     icon: CreditCard,
                                     bgColor: 'bg-green-50',
                                     textColor: 'text-green-600',
                                     borderColor: 'border-green-100',
                                     show: client.searchParams.isCreditSuitable
                                 },
                                 {
                                     label: 'Apto Mascotas',
                                     icon: Cat,
                                     bgColor: 'bg-green-50',
                                     textColor: 'text-green-600',
                                     borderColor: 'border-green-100',
                                     show: client.searchParams.isPetFriendly
                                 },
                                 {
                                     label: 'Apto Profesional',
                                     icon: Briefcase,
                                     bgColor: 'bg-blue-50',
                                     textColor: 'text-blue-600',
                                     borderColor: 'border-blue-100',
                                     show: client.searchParams.isProfessionalSuitable
                                 }
                             ].filter(tag => tag.show).map((tag, index) => {
                                 const Icon = tag.icon;
                                 return (
                                     <span
                                         key={index}
                                         className={`px-2 py-1 ${tag.bgColor} ${tag.textColor} text-[10px] font-bold uppercase rounded-md border ${tag.borderColor} flex items-center gap-1`}
                                     >
                                         <Icon size={10} /> {tag.label}
                                     </span>
                                 );
                             })}
                         </div>
                    </div>

                    {/* Footer Actions - Redesigned */}
                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center gap-3 group-hover:bg-white transition-colors">
                        
                        {/* Full Width Black Detail Button */}
                        <button 
                             onClick={() => setEditingClient(client)}
                             className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-gray-900/20 active:scale-95 transition-all"
                        >
                             Editar cliente <Edit2 size={14} />
                        </button>
                    </div>

                </div>
            )})}
        </div>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <EditClientModal 
          isOpen={true} 
          onClose={() => setEditingClient(null)} 
          client={editingClient}
          onSave={handleSaveClient}
          onDelete={() => handleDeleteClick(editingClient.id)}
        />
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal />

    </div>
  );
};
