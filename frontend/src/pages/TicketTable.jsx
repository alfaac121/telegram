
import { useState, useEffect } from 'react';
import API_URL from '../api';

export default function TicketTable({ user }) {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const token = localStorage.getItem('token');

  const fetchTickets = () => {
    setCargando(true);
    fetch(`${API_URL}/reportes`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setReportes)
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleUpdate = async (id, campo, valor) => {
    try {
      const res = await fetch(`${API_URL}/reportes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [campo]: valor })
      });
      if (res.ok) {
        setReportes(reportes.map(r => r.id === id ? { ...r, [campo]: valor } : r));
      } else {
        alert('Error al actualizar el ticket');
      }
    } catch (e) {
      console.error(e);
      alert('Fallo de conexión');
    }
  };

  const puedeEditar = user?.rol === 'admin' || user?.rol === 'tecnico';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Tickets de Soporte</h2>
        <button 
           onClick={fetchTickets} 
           disabled={cargando}
           className="px-4 py-1.5 bg-white text-slate-700 hover:text-blue-600 font-medium text-sm rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className={cargando ? "animate-spin" : ""}>🔄</span> {cargando ? 'Cargando...' : 'Actualizar'}
        </button>
      </div>
      <div className="overflow-x-auto relative">
        {cargando && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"></div>}
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-3 border-b border-slate-200">ID</th>
              <th className="px-6 py-3 border-b border-slate-200">Área</th>
              <th className="px-6 py-3 border-b border-slate-200">Usuario</th>
              <th className="px-6 py-3 border-b border-slate-200">Punto</th>
              <th className="px-6 py-3 border-b border-slate-200">Falla</th>
              <th className="px-6 py-3 border-b border-slate-200">Asesora</th>
              <th className="px-6 py-3 border-b border-slate-200">Evidencia</th>
              <th className="px-6 py-3 border-b border-slate-200">Técnico</th>
              <th className="px-6 py-3 border-b border-slate-200">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportes.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">#{r.id}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    r.area === 'Soporte TI' ? 'bg-blue-100 text-blue-700' :
                    r.area === 'Comercial' ? 'bg-emerald-100 text-emerald-700' :
                    r.area === 'Talento Humano' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {r.area || 'Soporte TI'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{r.nombre || 'Desconocido'}</td>
                <td className="px-6 py-4 text-slate-700">{r.punto || '-'}</td>
                <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{r.falla}</td>
                <td className="px-6 py-4 text-slate-600">
                  {r.asesora
                    ? <a href={`tel:${r.asesora.replace(/\s/g,'')}`} className="font-medium text-emerald-600 hover:underline">📞 {r.asesora}</a>
                    : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-6 py-4">
                  {r.imagen ? <a href={`${API_URL}/reportes/${r.id}/imagen?token=${token}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Ver Foto</a> : <span className="text-slate-400">N/A</span>}
                </td>
                <td className="px-6 py-4 text-slate-700">
                     {puedeEditar && user?.rol === 'admin' ? (
                      <input 
                        type="text" 
                        defaultValue={r.tecnico || ''} 
                        onBlur={(e) => { if(e.target.value !== (r.tecnico || '')) handleUpdate(r.id, 'tecnico', e.target.value) }}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.target.blur(); } }}
                        className="border border-slate-300 rounded px-2 py-1 w-32 focus:outline-none focus:border-blue-500"
                        placeholder="Asignar..."
                      />
                    ) : (
                     r.tecnico || 'Sin asignar'
                   )}
                </td>
                <td className="px-6 py-4">
                  {puedeEditar ? (
                    <select 
                      value={r.estado} 
                      onChange={(e) => handleUpdate(r.id, 'estado', e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold border-none outline-none cursor-pointer ${r.estado === 'resuelto' ? 'bg-emerald-100 text-emerald-700' : r.estado === 'en_proceso' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelto">Resuelto</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.estado === 'resuelto' ? 'bg-emerald-100 text-emerald-700' : r.estado === 'en_proceso' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.estado}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {reportes.length === 0 && (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-slate-500">No hay tickets disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
