
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../api';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        
        // Fetch full profile immediately to get permissions
        const meRes = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${data.token}` } });
        const meData = await meRes.json();
        
        setUser({ ...meData.user, permisos: meData.permisos });
        navigate('/');
      } else {
        setErr(data.error);
      }
    } catch (error) {
      setErr('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="h-2 bg-blue-600 w-full"></div>
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Acceso Corporativo</h1>
            <p className="text-slate-500 text-sm mt-2">HUB Centralizado</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuario / Email</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="admin@admin.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="••••••••" />
            </div>
            
            {err && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{err}</div>}
            
            <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98]">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
