
import { useState } from 'react';

const traslados = [
  { id: 'TRS-001', empleado: 'Luis Martínez',  origen: 'Sede Central',    destino: 'Sucursal Norte', fecha: '2026-04-18', motivo: 'Apoyo operativo',     estado: 'aprobado'  },
  { id: 'TRS-002', empleado: 'Clara Vega',     origen: 'Sucursal Norte',  destino: 'Sede Central',   fecha: '2026-04-20', motivo: 'Capacitación',        estado: 'pendiente' },
  { id: 'TRS-003', empleado: 'Jorge Salazar',  origen: 'Almacén',         destino: 'Sucursal Sur',   fecha: '2026-04-22', motivo: 'Reubicación',         estado: 'aprobado'  },
  { id: 'TRS-004', empleado: 'Diana Ríos',     origen: 'Sede Central',    destino: 'Almacén',        fecha: '2026-04-23', motivo: 'Inventario especial', estado: 'pendiente' },
  { id: 'TRS-005', empleado: 'Andrés Castillo',origen: 'Sucursal Sur',    destino: 'Sede Central',   fecha: '2026-04-25', motivo: 'Reunión ejecutiva',   estado: 'rechazado' },
];

export default function DemoTraslados() {
  const [filtro, setFiltro] = useState('todos');

  const filtrados = filtro === 'todos' ? traslados : traslados.filter(t => t.estado === filtro);

  const badge = (estado) => ({
    aprobado:  'bg-emerald-100 text-emerald-700',
    pendiente: 'bg-amber-100 text-amber-700',
    rechazado: 'bg-red-100 text-red-700',
  }[estado]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Traslados de Personal</h1>
        <p className="text-slate-500 text-sm mt-1">Control y aprobación de movimientos internos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Aprobados',  color: 'text-emerald-600', estado: 'aprobado'  },
          { label: 'Pendientes', color: 'text-amber-600',   estado: 'pendiente' },
          { label: 'Rechazados', color: 'text-red-600',     estado: 'rechazado' },
        ].map(({ label, color, estado }) => (
          <div key={estado} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>
              {traslados.filter(t => t.estado === estado).length}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla con filtro */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Solicitudes de Traslado</h2>
          <div className="flex gap-2">
            {['todos','aprobado','pendiente','rechazado'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  filtro === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                {['Folio','Empleado','Origen','Destino','Fecha','Motivo','Estado'].map(h=>(
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{t.empleado}</td>
                  <td className="px-5 py-3 text-slate-600">{t.origen}</td>
                  <td className="px-5 py-3 text-slate-600">{t.destino}</td>
                  <td className="px-5 py-3 text-slate-600">{t.fecha}</td>
                  <td className="px-5 py-3 text-slate-600 max-w-[150px] truncate">{t.motivo}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badge(t.estado)}`}>{t.estado}</span>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-8 text-center text-slate-400">Sin resultados para este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
