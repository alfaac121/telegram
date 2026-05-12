
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API_URL from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalReportes: 0, pendientes: 0, resueltos: 0, enProceso: 0, totalUsuarios: 0, tecnicos: [] });
  const [tecnicoSel, setTecnicoSel] = useState('todos');
  const cardsRef = useRef([]);

  const fetchStats = () => {
    const url = `${API_URL}/reportes/stats${tecnicoSel !== 'todos' ? `?tecnico=${tecnicoSel}` : ''}`;
    fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  };

  useEffect(() => {
    fetchStats();
  }, [tecnicoSel]);

  useEffect(() => {
    gsap.fromTo(cardsRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, []);

  const Card = ({ title, value, color, idx }) => (
    <div ref={el => cardsRef.current[idx] = el} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <span className="text-slate-500 font-medium text-sm mb-1">{title}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
  );

  const chartData = [
    { name: 'Pendientes', value: Math.max(stats.pendientes, 0.01), real: stats.pendientes, color: '#f59e0b' },
    { name: 'En Proceso', value: Math.max(stats.enProceso,  0.01), real: stats.enProceso,  color: '#3b82f6' },
    { name: 'Resueltos',  value: Math.max(stats.resueltos,  0.01), real: stats.resueltos,  color: '#10b981' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumen Estadístico</h1>
          <p className="text-slate-500">Métricas en tiempo real del sistema</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-slate-500 text-sm font-medium ml-2">Filtro por Técnico:</span>
          <select 
            value={tecnicoSel} 
            onChange={(e) => setTecnicoSel(e.target.value)}
            className="bg-slate-50 border-none text-slate-700 text-sm font-semibold rounded-md focus:ring-0 cursor-pointer pr-8"
          >
            <option value="todos">🌍 Todos los técnicos</option>
            {stats.tecnicos && stats.tecnicos.map(t => (
              <option key={t} value={t}>👨‍🔧 {t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card idx={0} title="Total Tickets"   value={stats.totalReportes} color="text-slate-800"   />
        <Card idx={1} title="Pendientes"      value={stats.pendientes}    color="text-amber-500"   />
        <Card idx={2} title="En Proceso"      value={stats.enProceso}     color="text-blue-500"    />
        <Card idx={3} title="Resueltos"       value={stats.resueltos}     color="text-emerald-500" />
        <Card idx={4} title="Usuarios Vivos"  value={stats.totalUsuarios} color="text-indigo-500"  />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Estado de los Tickets</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(_value, name, props) => [props.payload.real, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 600 }}>
                      {value}: {entry.payload.real}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-blue-100 flex flex-col justify-center items-center shadow-inner" style={{background: 'linear-gradient(120deg, #eff6ff 0%, #f8fafc 100%)'}}>
           <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
             <span className="text-2xl">✨</span>
           </div>
           <h3 className="text-blue-800 font-semibold text-lg text-center">Operatividad Centralizada</h3>
           <p className="text-blue-600 text-center mt-2 text-sm max-w-xs">Este servidor procesa tu bot de Telegram y expone la API para el portal simultáneamente.</p>
        </div>
      </div>
    </div>
  );
}
