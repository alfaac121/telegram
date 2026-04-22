
import { useState } from 'react';

const sims = [
  { icc: '8957001122334455001', numero: '+57 310 000 0001', usuario: 'Juan Pérez',     plan: 'Corporativo 10GB', estado: 'activa',    consumo: 7.2  },
  { icc: '8957001122334455002', numero: '+57 310 000 0002', usuario: 'Ana Gómez',      plan: 'Corporativo 10GB', estado: 'activa',    consumo: 2.1  },
  { icc: '8957001122334455003', numero: '+57 310 000 0003', usuario: 'Carlos Ruiz',    plan: 'Básico 3GB',       estado: 'suspendida',consumo: 3.0  },
  { icc: '8957001122334455004', numero: '+57 310 000 0004', usuario: 'María López',    plan: 'Corporativo 10GB', estado: 'activa',    consumo: 0.8  },
  { icc: '8957001122334455005', numero: '+57 310 000 0005', usuario: 'Pedro Torres',   plan: 'Básico 3GB',       estado: 'activa',    consumo: 1.5  },
  { icc: '8957001122334455006', numero: '+57 310 000 0006', usuario: 'Sin asignar',    plan: '—',                estado: 'inactiva',  consumo: 0    },
];

export default function DemoSIMS() {
  const [buscar, setBuscar] = useState('');
  const filtradas = sims.filter(s =>
    s.usuario.toLowerCase().includes(buscar.toLowerCase()) ||
    s.numero.includes(buscar)
  );

  const badge = (estado) => ({
    activa:     'bg-emerald-100 text-emerald-700',
    suspendida: 'bg-amber-100 text-amber-700',
    inactiva:   'bg-slate-100 text-slate-500',
  }[estado] || 'bg-slate-100 text-slate-500');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">SIMS — Gestión de SIM Cards</h1>
        <p className="text-slate-500 text-sm mt-1">Control de líneas móviles corporativas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total SIMs</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{sims.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Activas</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{sims.filter(s=>s.estado==='activa').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Suspendidas/Inactivas</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{sims.filter(s=>s.estado!=='activa').length}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4">
          <h2 className="font-semibold text-slate-700">Líneas Corporativas</h2>
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por usuario o número…"
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                {['ICC','Número','Usuario','Plan','Consumo','Estado'].map(h=>(
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map(s => (
                <tr key={s.icc} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{s.icc.slice(-6)}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.numero}</td>
                  <td className="px-5 py-3 text-slate-700">{s.usuario}</td>
                  <td className="px-5 py-3 text-slate-600">{s.plan}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${Math.min((s.consumo/10)*100,100)}%`}}></div>
                      </div>
                      <span className="text-xs text-slate-600">{s.consumo} GB</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badge(s.estado)}`}>{s.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
