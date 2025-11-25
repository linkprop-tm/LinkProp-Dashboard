
import React, { useState, useEffect } from 'react';
import { 
  Building, Users, Heart, TrendingUp, MoreHorizontal, ArrowUpRight, ArrowDownRight, Eye, Clock, BarChart2, GitCompareArrows
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { METRICS, CHART_DATA, TOP_PROPERTIES, RECENT_ACTIVITY, CONVERSION_DATA } from '../constants';

export const Dashboard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      
      {/* Section A: Metrics Cards (Modern Redesign) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, index) => {
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
                    <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">{metric.value}</h3>
                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">{metric.label}</p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section B & C: Chart and Top Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Actividad Mensual</h3>
              <p className="text-sm text-gray-500">Propiedades vs Intereses</p>
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

        {/* Top Properties */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-900">Top Propiedades</h3>
             <button className="text-sm text-primary-600 font-medium hover:text-primary-700">Ver todas</button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {TOP_PROPERTIES.map((prop, idx) => (
              <div key={prop.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <img src={prop.imageUrl} alt={prop.title} className="w-full h-full object-cover" />
                  <div className="absolute top-0 left-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 font-bold rounded-br-md">
                    #{idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{prop.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{prop.address}</p>
                  <p className="text-xs font-medium text-gray-900 mt-1">
                    {prop.currency === 'USD' ? 'USD' : '$'} {prop.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right min-w-[100px]">
                  <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-primary-600 mb-1" title="Clientes con Match">
                    <GitCompareArrows size={14} /> {prop.matchesCount} Matches
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-xs text-gray-500 font-medium">
                    <Heart size={12} className="text-rose-500 fill-rose-500" /> {prop.interestedClients} Intereses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section D: Conversion Chart & Recent Activity */}
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
                  <p className="text-sm text-gray-500">Visitas presenciales vs Cierres</p>
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
            <button className="p-2 hover:bg-gray-50 rounded-full">
              <MoreHorizontal size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[300px]">
            {RECENT_ACTIVITY.map((item) => {
              let Icon = Clock;
              let iconBg = 'bg-gray-100';
              let iconColor = 'text-gray-500';

              if (item.type === 'interest') { Icon = Heart; iconBg = 'bg-rose-100'; iconColor = 'text-rose-600'; }
              if (item.type === 'new_property') { Icon = Building; iconBg = 'bg-blue-100'; iconColor = 'text-blue-600'; }
              if (item.type === 'match') { Icon = TrendingUp; iconBg = 'bg-amber-100'; iconColor = 'text-amber-600'; }

              return (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm text-gray-900">{item.description}</p>
                     <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                  {item.userAvatar && (
                    <img src={item.userAvatar} alt="User" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-4 text-center border-t border-gray-100 bg-gray-50/50 mt-auto">
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Ver todo el historial</button>
          </div>
        </div>

      </div>

    </main>
  );
};
