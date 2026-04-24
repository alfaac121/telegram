
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_URL from './api';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketTable from './pages/TicketTable';
import ExternalModule from './components/ExternalModule';

const ProtectedRoute = ({ children, user }) => {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 overflow-auto p-8 relative" id="main-content">
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Inválido'))
      .then(data => setUser({ ...data.user, permisos: data.permisos }))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="flex bg-slate-900 justify-center h-screen items-center text-white">Cargando Sistema...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
        <Route path="/soporte/tickets"      element={<ProtectedRoute user={user}><TicketTable user={user} /></ProtectedRoute>} />
        <Route path="/soporte/manageengine" element={<ProtectedRoute user={user}><ExternalModule name="ManageEngine"  url="https://www.manageengine.com" /></ProtectedRoute>} />

        <Route path="/operaciones/bnet"    element={<ProtectedRoute user={user}><ExternalModule name="BNET"      url="http://bnet.tuempresa.local" /></ProtectedRoute>} />
        <Route path="/operaciones/sims"    element={<ProtectedRoute user={user}><ExternalModule name="SIMS"      url="http://sims.tuempresa.local" /></ProtectedRoute>} />
        <Route path="/personal/traslados"  element={<ProtectedRoute user={user}><ExternalModule name="Traslados" url="http://traslados.tuempresa.local" /></ProtectedRoute>} />
        <Route path="/personal/sis"        element={<ProtectedRoute user={user}><ExternalModule name="SIS"       url="http://sis.tuempresa.local" /></ProtectedRoute>} />

        <Route path="/admin/usuarios" element={<ProtectedRoute user={user}><div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-slate-600">Panel Admin — En desarrollo 🚧</div></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
