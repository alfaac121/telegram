
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function ExternalModule({ name, url }) {
  const [estado, setEstado] = useState('cargando'); // 'cargando' | 'ok' | 'bloqueado'
  const iframeRef    = useRef(null);
  const containerRef = useRef(null);
  const timerRef     = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    setEstado('cargando');

    // Si onLoad no dispara en 8s → el sitio rechazó totalmente la conexión
    timerRef.current = setTimeout(() => {
      setEstado('bloqueado');
    }, 8000);

    return () => clearTimeout(timerRef.current);
  }, [url]);

  const handleLoad = () => {
    clearTimeout(timerRef.current);
    // Intentamos leer la URL del iframe para saber si es accesible (misma origen)
    // En sitios cross-origin lanza SecurityError → asumimos que cargó igualmente
    try {
      const href = iframeRef.current?.contentWindow?.location?.href;
      // Si llegamos aquí y href es 'about:blank' → no cargó nada (bloqueo silencioso)
      if (href === 'about:blank') {
        setEstado('bloqueado');
      } else {
        setEstado('ok');
      }
    } catch {
      // SecurityError = sitio cross-origin que SÍ cargó → mostrarlo
      setEstado('ok');
    }
  };

  const handleError = () => {
    clearTimeout(timerRef.current);
    setEstado('bloqueado');
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Barra superior */}
      <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${estado === 'ok' ? 'bg-emerald-500' : estado === 'bloqueado' ? 'bg-red-400' : 'bg-blue-500 animate-pulse'}`}></div>
          <h2 className="font-semibold text-slate-700">Módulo: {name}</h2>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs flex items-center gap-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors text-slate-600 px-3 py-1.5 rounded-lg font-medium shadow-sm"
        >
          Abrir en pestaña ↗
        </a>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 relative overflow-hidden">

        {/* Spinner de carga */}
        {estado === 'cargando' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-50 z-10">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium">Conectando con {name}…</p>
          </div>
        )}

        {/* Fallback cuando está bloqueado */}
        {estado === 'bloqueado' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50 z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mb-5 text-4xl shadow-inner">
              🔗
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-8 leading-relaxed">
              Este sistema no puede incrustarse aquí por reglas del navegador.
              <br />Haz clic abajo para abrirlo en una pestaña dedicada.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-blue-200 hover:shadow-lg text-sm flex items-center gap-2"
            >
              🚀 Abrir {name}
            </a>
            <p className="text-xs text-slate-400 mt-5 font-mono">{url}</p>
          </div>
        )}

        {/* iframe — siempre montado, visible solo cuando cargó bien */}
        <iframe
          ref={iframeRef}
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          title={name}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          className={`w-full h-full border-0 transition-opacity duration-500 ${estado === 'ok' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}
        />
      </div>
    </div>
  );
}
