

import React, { useState, useEffect } from 'react';
import {
  Building, Users, Heart, TrendingUp, MoreHorizontal, ArrowUpRight, ArrowDownRight, Eye, Clock, BarChart2, GitCompareArrows, Calendar, Mail, MapPin, Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { METRICS, CHART_DATA, CONVERSION_DATA, CLIENTS_DATA, PROPERTIES_GRID_DATA } from '../constants';
import { obtenerPropiedadesDisponibles } from '../lib/api/properties';
import { obtenerClientesActivos, obtenerUltimosClientes } from '../lib/api/users';
import { contarRelacionesPorEtapa, obtenerUltimosIntereses, type InteresReciente } from '../lib/api/relationships';
import { usuarioToClient } from '../lib/adapters';
import type { Client } from '../types';

export const Dashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [propiedadesDisponibles, setPropiedadesDisponibles] = useState<number>(0);
  const [clientesActivos, setClientesActivos] = useState<number>(0);
  const [interesesMes, setInteresesMes] = useState<number>(0);
  const [ultimosClientes, setUltimosClientes] = useState<Client[]>([]);
  const [ultimosIntereses, setUltimosIntereses] = useState<InteresReciente[]>([]);

  useEffect(() => {
    setIsMounted(true);
    loadPropiedadesDisponibles();
    loadClientesActivos();
    loadInteresesMes();
    loadUltimosClientes();
    loadUltimosIntereses();
  }, []);

  const loadPropiedadesDisponibles = async () => {
    try {
      const propiedades = await obtenerPropiedadesDisponibles();
      setPropiedadesDisponibles(propiedades.length);
    } catch (error) {
      console.error('Error loading propiedades disponibles:', error);
    }
  };

  const loadClientesActivos = async () => {
    try {
      const clientes = await obtenerClientesActivos();
      setClientesActivos(clientes.length);
    } catch (error) {
      console.error('Error loading clientes activos:', error);
    }
  };

  const loadInteresesMes = async () => {
    try {
      const count = await contarRelacionesPorEtapa('Interes');
      setInteresesMes(count);
    } catch (error) {
      console.error('Error loading intereses:', error);
    }
  };

  const loadUltimosClientes = async () => {
    try {
      const usuarios = await obtenerUltimosClientes(5);
      const clientes = usuarios.map(usuario => usuarioToClient(usuario));
      setUltimosClientes(clientes);
    } catch (error) {
      console.error('Error loading ultimos clientes:', error);
    }
  };

  const loadUltimosIntereses = async () => {
    try {
      const intereses = await obtenerUltimosIntereses(5);
      setUltimosIntereses(intereses);
    } catch (error) {
      console.error('Error loading ultimos intereses:', error);
    }
  };

  // Generate mock visit requests combining properties and clients for the "Intereses" mini-view
  const VISIT_REQUESTS = PROPERTIES_GRID_DATA.slice(0, 5).map((prop, index) => {
     const client = CLIENTS_DATA[index % CLIENTS_DATA.length];
     return {
         id: `req-${index}`,
         property: prop,
         client: client,
         time: `${index + 2} horas`
     };
  });

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      
      {/* Section A: Metrics Cards (Modern Redesign) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, index) => {
          const displayValue = index === 0 ? propiedadesDisponibles : index === 1 ? clientesActivos : index === 2 ? interesesMes : metric.value;
          const Icon = 
            metric.iconType === 'building' ? Building :
            metric.iconType === 'users' ? Users :
            metric.iconType === 'heart' ? Heart : TrendingUp;
          
          // Color themes based on index/type
          const themes = [
            { bg: 'bg-blue-50', text: 'text-blue-600', shadow: 'shadow-blue-200', gradient: 'from-blue-500/10 to-transparent' },
            { bg: 'bg-violet-50', text: 'text-violet-600', shadow: 'shadow-violet-200', gradient: 'from-violet-500/10 to-transparent' },
            { bg: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-200', gradient: 'from-rose-500/10 to-transparent' },
            { bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-200', gradient: 'from-emerald-500/10 to-transparent' },
          ];
          
          const t = themes[index % themes.length];
          const isUp = metric.trendDirection === 'up';

          return (
            <div 
              key={index} 
              className="relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 group cursor-default"
            >
              {/* Decorative Background Blob */}
              <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${t.gradient} blur-3xl group-hover:scale-150 transition-transform duration-700 ease-out`}></div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                 {/* Header: Icon & Trend */}
                 <div className="flex justify-between items-start mb-4">
                    <div className={`p-3.5 rounded-2xl ${t.bg} ${t.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                       <Icon size={24} strokeWidth={2.5} />
                    </div>
                    
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isUp ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                       {isUp ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                       {metric.trend}%
                    </div>
                 </div>

                 {/* Content: Value & Label */}
                 <div>
                    <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">{displayValue}</h3>
                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">{metric.label}</p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section B & C: Chart and Latest Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                   <Activity size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-gray-900">Actividad Mensual</h3>
                 <p className="text-sm text-gray-500">Propiedades vs Intereses</p>
               </div>
            </div>
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
               <button className="px-3 py-1 bg-white rounded shadow-sm text-gray-900">30 días</button>
               <button className="px-3 py-1 text-gray-500 hover:text-gray-900">90 días</button>
            </div>
          </div>
          
          <div className="h-64 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInterests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontSize: '12px', fontWeight: 600}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="interests" 
                    stroke="#e11d48" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorInterests)" 
                    name="Intereses"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="props" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    fill="none" 
                    name="Propiedades"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-600"></div>
              <span>Intereses Generados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Propiedades Subidas</span>
            </div>
          </div>
        </div>

        {/* Latest Clients (Replaced Top Properties) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Users size={20} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">Últimos Clientes</h3>
             </div>
             <button className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                Ver Cartera
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {ultimosClientes.length > 0 ? (
              ultimosClientes.map((client) => (
                <div key={client.id} className="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm rounded-xl transition-all group cursor-pointer">
                  <div className="relative flex-shrink-0">
                    {client.avatar ? (
                      <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                    ) : (
                      <div className="w-10 h-10 rounded-full ring-2 ring-white bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                        {client.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{client.name || 'Usuario sin nombre'}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                       <Mail size={10} />
                       <span className="truncate">{client.email || 'Sin email'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-1 rounded border border-gray-100">
                      {client.date}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                No hay clientes registrados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section D: Conversion Chart & Visit Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Conversion Rate Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Conversión de Ventas</h3>
                  <p className="text-sm text-gray-500">Match vs Visita</p>
                </div>
              </div>
              <div className="text-right">
                 <span className="block text-2xl font-bold text-gray-900">4.8%</span>
                 <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                   <TrendingUp size={12} /> +0.5%
                 </span>
              </div>
           </div>

           <div className="h-64 w-full min-w-0">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONVERSION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="visitas" name="Visitas Agendadas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="compras" name="Cierres (Venta/Alquiler)" fill="#059669" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
           </div>
        </div>

        {/* Visit Requests (Replaced Recent Activity) -> Interés en visitar reciente */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <Heart size={20} className="fill-rose-600" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-900">Interés en visitar reciente</h3>
                  <p className="text-xs text-gray-500">Solicitudes de clientes potenciales</p>
               </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[350px] p-0">
            <div className="divide-y divide-gray-50">
                {ultimosIntereses.length > 0 ? (
                  ultimosIntereses.map((interes) => {
                    const imagenPropiedad = interes.propiedad.imagenes?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                    const avatarUsuario = interes.usuario.foto_perfil_url;
                    const nombreUsuario = interes.usuario.full_name || 'Usuario';
                    const tituloPropiedad = interes.propiedad.titulo || 'Propiedad';

                    return (
                      <div key={interes.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group cursor-default">
                        <div className="relative flex-shrink-0">
                          <img src={imagenPropiedad} className="w-12 h-12 rounded-lg object-cover shadow-sm ring-1 ring-gray-100" alt={tituloPropiedad} />
                          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full ring-2 ring-white overflow-hidden shadow-sm">
                            {avatarUsuario ? (
                              <img src={avatarUsuario} className="w-full h-full object-cover" alt={nombreUsuario} />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                {nombreUsuario.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{nombreUsuario}</h4>
                            <span className="text-[10px] font-medium text-gray-400">
                              {interes.tiempo_transcurrido}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            Interesado en <span className="font-semibold text-gray-700">{tituloPropiedad}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                    No hay intereses recientes
                  </div>
                )}
            </div>
          </div>
          
          <div className="p-4 text-center border-t border-gray-100 bg-white mt-auto">
            <button className="w-full py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all flex items-center justify-center gap-2">
               Ver todos los interesados <ArrowUpRight size={16}/>
            </button>
          </div>
        </div>

      </div>

    </main>
  );
};