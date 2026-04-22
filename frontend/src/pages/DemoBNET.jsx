
export default function DemoBNET() {
  const dispositivos = [
    { id: 'R-001', nombre: 'Router Core HQ',    ip: '192.168.1.1',   estado: 'online',  latencia: '2ms',   zona: 'Sede Central' },
    { id: 'R-002', nombre: 'Switch Piso 2',      ip: '192.168.1.20',  estado: 'online',  latencia: '5ms',   zona: 'Sede Central' },
    { id: 'R-003', nombre: 'AP Cafetería',       ip: '192.168.1.45',  estado: 'warning', latencia: '120ms', zona: 'Sede Central' },
    { id: 'R-004', nombre: 'Router Sucursal Norte', ip: '10.0.1.1',  estado: 'online',  latencia: '18ms',  zona: 'Sucursal Norte' },
    { id: 'R-005', nombre: 'Firewall Perimetral', ip: '192.168.0.1', estado: 'online',  latencia: '1ms',   zona: 'Sede Central' },
    { id: 'R-006', nombre: 'AP Sala Reuniones',  ip: '192.168.1.82',  estado: 'offline', latencia: '—',     zona: 'Sede Central' },
    { id: 'R-007', nombre: 'Switch Almacén',     ip: '10.0.2.5',     estado: 'online',  latencia: '8ms',   zona: 'Almacén' },
  ];

  const badge = (estado) => {
    const map = {
      online:  'bg-emerald-100 text-emerald-700',
      warning: 'bg-amber-100 text-amber-700',
      offline: 'bg-red-100 text-red-700',
    };
    return map[estado] || 'bg-slate-100 text-slate-600';
  };

  const dot = (estado) => {
    const map = { online: 'bg-emerald-400', warning: 'bg-amber-400', offline: 'bg-red-400' };
    return map[estado] || 'bg-slate-400';
  };

  const online  = dispositivos.filter(d => d.estado === 'online').length;
  const warning = dispositivos.filter(d => d.estado === 'warning').length;
  const offline = dispositivos.filter(d => d.estado === 'offline').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">BNET — Monitor de Red</h1>
        <p className="text-slate-500 text-sm mt-1">Estado en tiempo real de dispositivos de red</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-lg">✅</div>
          <div><p className="text-xs text-slate-500 uppercase tracking-wide">En Línea</p><p className="text-2xl font-bold text-emerald-600">{online}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-lg">⚠️</div>
          <div><p className="text-xs text-slate-500 uppercase tracking-wide">Advertencia</p><p className="text-2xl font-bold text-amber-600">{warning}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-lg">🔴</div>
          <div><p className="text-xs text-slate-500 uppercase tracking-wide">Sin señal</p><p className="text-2xl font-bold text-red-600">{offline}</p></div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <h2 className="font-semibold text-slate-700">Inventario de Dispositivos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                {['ID','Dispositivo','IP','Zona','Latencia','Estado'].map(h => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispositivos.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{d.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-800 flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${dot(d.estado)}`}></span>{d.nombre}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{d.ip}</td>
                  <td className="px-5 py-3 text-slate-600">{d.zona}</td>
                  <td className="px-5 py-3 font-mono text-slate-700">{d.latencia}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badge(d.estado)}`}>{d.estado}</span>
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
