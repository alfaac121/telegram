// ── Autenticación Local ───────────────────────────────────────────
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
  window.location.href = '/login.html';
}

const authUser = JSON.parse(userStr);
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

function cerrarSesion() {
  localStorage.clear();
  window.location.href = '/login.html';
}

// ── Estado de la aplicación ───────────────────────────────────────
let reportesData = [];
let usuariosData = [];
let miGrafico = null;

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar info de usuario
  document.getElementById('sidebarUserName').textContent = authUser.nombre || 'Usuario';
  document.getElementById('sidebarUserRole').textContent = authUser.rol || 'Tecnico';

  cargarTodo();
  // Auto actualizar cada 30 segundos
  setInterval(cargarTodo, 30000);
});

// ── Carga General ───────────────────────────────────────────────
async function cargarTodo() {
  const btn = document.querySelector('.btn-primary i');
  if (btn) btn.classList.add('ph-spin');

  try {
    await Promise.all([
      cargarStats(),
      cargarReportes(),
      cargarUsuarios()
    ]);
  } finally {
    if (btn) btn.classList.remove('ph-spin');
  }
}

async function cargarStats() {
  const badge = document.getElementById('dbStatus');
  const badgeText = badge.querySelector('span');
  
  try {
    const res = await fetch('/api/stats', { headers: authHeaders });
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();

    document.getElementById('totalReportes').textContent = data.totalReportes;
    document.getElementById('pendientes').textContent = data.pendientes;
    document.getElementById('resueltos').textContent = data.resueltos;
    document.getElementById('totalUsuarios').textContent = data.totalUsuarios;

    badge.classList.add('connected');
    badgeText.textContent = 'En línea';

    // Update chart
    actualizarGrafico([data.pendientes, data.totalReportes - data.pendientes - data.resueltos, data.resueltos]);
  } catch (err) {
    console.error('Error stats:', err);
    badge.classList.remove('connected');
    badgeText.textContent = 'Error de conexión';
  }
}

// ── Navegación (Tabs) ───────────────────────────────────────────
function cambiarTab(tabId, event) {
  if (event) event.preventDefault();

  // Cambiar nav activa
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (targetNav) targetNav.classList.add('active');

  // Cambiar vista activa
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${tabId}`).classList.add('active');

  // Actualizar Títulos de Cabecera
  const titles = {
    'dashboard': { t: 'Resumen General', s: 'Métricas y estadísticas del bot' },
    'reportes': { t: 'Gestión de Reportes', s: 'Visualiza y actualiza los tickets' },
    'usuarios': { t: 'Directorio de Usuarios', s: 'Personas interactuando con el bot' },
  };

  const info = titles[tabId];
  if (info) {
    document.getElementById('pageTitle').textContent = info.t;
    document.getElementById('pageSubtitle').textContent = info.s;
  }
}

// ── Reportes ────────────────────────────────────────────────────
async function cargarReportes() {
  try {
    const res = await fetch('/api/reportes', { headers: authHeaders });
    reportesData = await res.json();
    renderReportes(reportesData);
    renderRecentReports(reportesData);
  } catch (err) {
    console.error('Error reportes:', err);
    document.getElementById('bodyReportes').innerHTML = `<tr><td colspan="7" class="loading-state">Error cargando datos...</td></tr>`;
  }
}

function renderReportes(data) {
  const tbody = document.getElementById('bodyReportes');
  
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-state">No hay reportes disponibles.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(r => {
    const d = new Date(r.fecha).toLocaleString('es-CO');
    return `
      <tr>
        <td><span class="ticket-link">#${r.id}</span></td>
        <td>${r.user_id}</td>
        <td>${r.punto || '-'}</td>
        <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHTML(r.falla || '-')}</td>
        <td>
          ${r.imagen ? `<a href="/api/reportes/${r.id}/imagen?token=${token}" target="_blank" class="badge" style="background:#e0e7ff; color:#3730a3; text-decoration:none;"><i class="ph ph-image"></i> Ver</a>` : '<span style="color:var(--text-muted); font-size:0.75rem;">Sin adjunto</span>'}
        </td>
        <td>
          ${authUser.rol === 'admin' 
            ? `<input type="text" class="tech-input" placeholder="Técnico..." value="${escapeHTML(r.tecnico || '')}" onchange="cambiarTecnico(${r.id}, this.value)" />`
            : `<span style="font-size:0.9rem;">${escapeHTML(r.tecnico || 'Sin asignar')}</span>`
          }
        </td>
        <td>${getBadgeHTML(r.estado)}</td>
        <td>${d}</td>
        <td>
          ${authUser.rol === 'supervisor'
            ? `<span style="color:var(--text-muted); font-size:0.8rem">Solo Lectura</span>`
            : `<select class="status-select" onchange="cambiarEstado(${r.id}, this.value)">
                <option value="" disabled selected>Acción</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
              </select>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

function renderRecentReports(data) {
  const cont = document.getElementById('recentTickets');
  const recientes = data.slice(0, 4); // Top 4

  if (recientes.length === 0) {
    cont.innerHTML = `<div class="loading-state">Sin actividad</div>`;
    return;
  }

  cont.innerHTML = recientes.map(r => `
    <div class="recent-item">
      <div class="recent-info">
        <span class="recent-id">Ticket #${r.id}</span>
        <span class="recent-msg">${escapeHTML(r.falla || 'Sin detalles')}</span>
      </div>
      <div class="recent-status">
        ${getBadgeHTML(r.estado)}
      </div>
    </div>
  `).join('');
}

function filtrarReportes() {
  const query = document.getElementById('buscarReporte').value.toLowerCase();
  const estado = document.getElementById('filtroEstado').value;

  const filtrados = reportesData.filter(r => {
    const matchE = estado === 'todos' || r.estado === estado;
    const matchQ = !query || 
      String(r.id).includes(query) || 
      (r.punto && r.punto.toLowerCase().includes(query)) ||
      (r.falla && r.falla.toLowerCase().includes(query));
    return matchE && matchQ;
  });

  renderReportes(filtrados);
}

async function cambiarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`/api/reportes/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    if (res.ok) {
      showToast(`El Ticket #${id} cambió a ${nuevoEstado}`, 'success');
      cargarTodo(); // recargar para actualizar gráfica y tarjeta reciente
    } else {
      showToast('Error al actualizar el ticket', 'error');
    }
  } catch (err) {
    showToast('Error de conexión', 'error');
  }
}

async function cambiarTecnico(id, tecnico) {
  try {
    const res = await fetch(`/api/reportes/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ tecnico }),
    });

    if (res.ok) {
      showToast(`Técnico asignado exitosamente al ticket #${id}`, 'success');
      // cargamos todo atrás para reflejar consistencia
      cargarTodo(); 
    } else {
      showToast('Error al asignar el técnico', 'error');
    }
  } catch (err) {
    showToast('Error de conexión', 'error');
  }
}

// ── Usuarios ────────────────────────────────────────────────────
async function cargarUsuarios() {
  try {
    const res = await fetch('/api/usuarios', { headers: authHeaders });
    usuariosData = await res.json();
    renderUsuarios(usuariosData);
  } catch (err) {
    console.error('Error usuarios:', err);
    document.getElementById('bodyUsuarios').innerHTML = `<tr><td colspan="4" class="loading-state">Error cargando datos...</td></tr>`;
  }
}

function renderUsuarios(data) {
  const tbody = document.getElementById('bodyUsuarios');
  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="loading-state">No hay usuarios registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(u => `
    <tr>
      <td style="font-family: var(--font-display); font-weight: 500;">${u.telegram_id}</td>
      <td>${escapeHTML(u.nombre || 'Desconocido')}</td>
      <td>${escapeHTML(u.punto || '-')}</td>
      <td style="color: var(--text-muted);">${escapeHTML(u.descripcion || '-')}</td>
    </tr>
  `).join('');
}

function filtrarUsuarios() {
  const query = document.getElementById('buscarUsuario').value.toLowerCase();
  const f = usuariosData.filter(u => 
    !query || 
    String(u.telegram_id).includes(query) ||
    (u.nombre && u.nombre.toLowerCase().includes(query))
  );
  renderUsuarios(f);
}

// ── Gráficos (Chart.js) ─────────────────────────────────────────
function actualizarGrafico(datos) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  
  if (miGrafico) {
    miGrafico.data.datasets[0].data = datos;
    miGrafico.update();
    return;
  }

  Chart.defaults.color = '#64748b';
  Chart.defaults.font.family = "'Inter', sans-serif";

  miGrafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'En Proceso', 'Resueltos'],
      datasets: [{
        data: datos,
        backgroundColor: [
          '#f59e0b', // Yellow
          '#3b82f6', // Bright Blue
          '#10b981'  // Emerald Green
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      }
    }
  });
}

// ── Utilidades ──────────────────────────────────────────────────
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getBadgeHTML(estado) {
  const map = {
    'pendiente': { l: 'Pendiente', c: 'ph-hourglass-high' },
    'en_proceso': { l: 'En Proceso', c: 'ph-wrench' },
    'resuelto': { l: 'Resuelto', c: 'ph-check-circle' }
  };
  const e = map[estado] || { l: estado, c: 'ph-info' };
  
  return `<span class="badge badge-${estado}">
    <i class="ph ${e.c}"></i> ${e.l}
  </span>`;
}

function showToast(msg, type = 'success') {
  const cont = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
  
  toast.innerHTML = `
    <i class="ph ${icon}"></i>
    <span>${msg}</span>
  `;
  
  cont.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
