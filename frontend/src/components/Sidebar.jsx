
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const MENU = [
  {
    seccion: 'Soporte',
    icono: '🎧',
    items: [
      { label: 'Tickets',      path: '/soporte/tickets' },
      { label: 'ManageEngine', path: '/soporte/manageengine' },
    ],
  },
  {
    seccion: 'Operaciones',
    icono: '⚙️',
    items: [
      { label: 'BNET', path: '/operaciones/bnet' },
      { label: 'SIMS', path: '/operaciones/sims' },
    ],
  },
  {
    seccion: 'Personal',
    icono: '🧑‍💼',
    items: [
      { label: 'Traslados', path: '/personal/traslados' },
      { label: 'SIS',       path: '/personal/sis' },
    ],
  },
  {
    seccion: 'Administración',
    icono: '🔧',
    items: [
      { label: 'Usuarios & Roles', path: '/admin/usuarios' },
    ],
  },
];

export default function Sidebar({ user }) {
  const sidebarRef = useRef(null);
  const location = useLocation();
  // Detectar qué sección tiene la ruta activa y abrirla por defecto
  const seccionActiva = MENU.find(s => s.items.some(i => location.pathname.startsWith(i.path)))?.seccion || null;
  const [abierto, setAbierto] = useState(seccionActiva);

  useEffect(() => {
    gsap.fromTo(sidebarRef.current,
      { x: -300 },
      { x: 0, duration: 0.45, ease: 'power3.out' }
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggle = (seccion) => setAbierto(prev => (prev === seccion ? null : seccion));

  return (
    <aside ref={sidebarRef} className="w-56 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full shadow-2xl z-20 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
          <span>🛡️</span> HUB Central
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">{user?.rol}</p>
      </div>

      {/* Dashboard rápido */}
      <div className="px-3 pt-3">
        <Link
          to="/"
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            location.pathname === '/' ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>📊</span> Dashboard
        </Link>
      </div>

      {/* Menú colapsable */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {MENU.map(({ seccion, icono, items }) => (
          <div key={seccion}>
            {/* Cabecera de sección */}
            <button
              onClick={() => toggle(seccion)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{icono}</span> {seccion}
              </span>
              <span className="text-slate-500 text-xs">{abierto === seccion ? '▲' : '▼'}</span>
            </button>

            {/* Sub-items */}
            {abierto === seccion && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-700 pl-3">
                {items.map(({ label, path }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`block px-2 py-1.5 rounded-md text-xs transition-colors ${
                      location.pathname === path
                        ? 'bg-blue-600/20 text-blue-400 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs">
          <p className="text-white font-medium truncate max-w-[90px]">{user?.username}</p>
          <p className="text-slate-500 capitalize">{user?.rol}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Cerrar Sesión"
          className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-colors text-base"
        >
          🚪
        </button>
      </div>
    </aside>
  );
}
