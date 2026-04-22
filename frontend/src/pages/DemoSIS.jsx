
const empleados = [
  { cedula: '10234567', nombre: 'Luis Martínez',   cargo: 'Técnico TI',         area: 'Soporte',       contrato: 'Indefinido', ingreso: '2021-03-15', activo: true  },
  { cedula: '20345678', nombre: 'Clara Vega',       cargo: 'Analista de Redes',  area: 'Infraestructura', contrato: 'Término fijo', ingreso: '2022-07-01', activo: true  },
  { cedula: '30456789', nombre: 'Jorge Salazar',    cargo: 'Operador Almacén',   area: 'Logística',     contrato: 'Indefinido', ingreso: '2019-11-20', activo: true  },
  { cedula: '40567890', nombre: 'Diana Ríos',       cargo: 'Coordinadora RRHH',  area: 'Recursos Humanos', contrato: 'Indefinido', ingreso: '2020-01-10', activo: true  },
  { cedula: '50678901', nombre: 'Andrés Castillo',  cargo: 'Supervisor Sucursal', area: 'Operaciones',  contrato: 'Término fijo', ingreso: '2023-02-14', activo: false },
  { cedula: '60789012', nombre: 'Patricia Neira',   cargo: 'Asistente Contable', area: 'Finanzas',      contrato: 'Indefinido', ingreso: '2018-06-30', activo: true  },
];

export default function DemoSIS() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">SIS — Sistema de Información de Personal</h1>
        <p className="text-slate-500 text-sm mt-1">Directorio y estado de empleados de la organización</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Empleados</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{empleados.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Activos</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{empleados.filter(e=>e.activo).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Indefinidos</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{empleados.filter(e=>e.contrato==='Indefinido').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Término Fijo</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{empleados.filter(e=>e.contrato==='Término fijo').length}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <h2 className="font-semibold text-slate-700">Directorio de Personal</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                {['Cédula','Nombre','Cargo','Área','Contrato','Ingreso','Estado'].map(h=>(
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empleados.map(e => (
                <tr key={e.cedula} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{e.cedula}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{e.nombre}</td>
                  <td className="px-5 py-3 text-slate-700">{e.cargo}</td>
                  <td className="px-5 py-3 text-slate-600">{e.area}</td>
                  <td className="px-5 py-3 text-slate-600">{e.contrato}</td>
                  <td className="px-5 py-3 text-slate-600">{e.ingreso}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${e.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
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
