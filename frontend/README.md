# 🖥️ Panel Administrativo (Frontend)

Esta carpeta contiene la interfaz de usuario moderna diseñada para gestionar los tickets de soporte del bot de Telegram. Está construida como una **Single Page Application (SPA)** reactiva y premium.

---

## 🛠️ Stack Tecnológico
- **Framework:** [React 18](https://reactjs.org/) con **Vite** para una carga ultra rápida.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño basado en utilidades).
- **Iconografía:** [Phosphor Icons](https://phosphoricons.com/).
- **Gráficos:** [Recharts](https://recharts.org/) para métricas de tickets en tiempo real.
- **Animaciones:** [GSAP](https://greensock.com/gsap/) para transiciones suaves y micro-interacciones.
- **Enrutado:** [React Router DOM v6](https://reactrouter.com/).

---

## 🚀 Configuración e Instalación

### 1. Requisitos
Asegúrate de tener instalada la carpeta de dependencias:
```bash
cd frontend
npm install
```

### 2. Configuración de API
Por defecto, el frontend busca el servidor en `http://localhost:3000`. Si cambias el puerto del backend, debes actualizar esta línea en los archivos mencionados:

```javascript
// Ejemplo de configuración en Login.jsx y App.jsx
const API_BASE_URL = 'http://localhost:3000/api';

// Uso en una petición:
const res = await fetch(`${API_BASE_URL}/auth/login`, { ... });
```

**Archivos a editar si el puerto cambia:**
- `src/App.jsx` (Línea 29)
- `src/pages/Login.jsx` (Línea 15 y 26)
- `src/pages/TicketTable.jsx` (En las funciones de carga y actualización)

### 3. Comandos de Terminal
| Comando         | Descripción |
| :---            |   ---       |
| `npm run dev`   | Inicia el servidor de desarrollo (hace cambios en vivo). |
| `npm run build` | Genera la carpeta `dist/` para producción. |

---

## 📂 Organización del Código

- **`src/components/`**: Como el `Sidebar.jsx`, que gestiona los enlaces según los permisos del usuario logueado.
- **`src/pages/`**: 
  - `Login.jsx`: Gestiona la entrada.
  - `Dashboard.jsx`: Muestra estadísticas usando `Recharts`.
  - `TicketTable.jsx`: Lógica de gestión de tickets:
  ```javascript
  // Ejemplo de cómo se cargan los tickets
  const fetchTickets = async () => {
    const res = await fetch('http://localhost:3000/api/reportes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };
  ```

---

## 🔐 Seguridad y Autenticación
El panel guarda el token para persistir la sesión:

```javascript
// Fragmento de Login.jsx
if (res.ok) {
  localStorage.setItem('token', data.token); // Guarda el token en el PC
  setUser(data.user); // Actualiza el estado global
  navigate('/'); // Manda al usuario al inicio
}
```
Si quieres borrar la sesión manualmente, puedes usar `localStorage.removeItem('token')` o simplemente cerrar la pestaña (aunque el token persistirá hasta que el servidor lo invalide o el usuario cierre sesión).

---

## 🎨 Diseño y UX
- **Phosphor Icons:** Se usan para el menú visual.
- **GSAP:** Añadido para animaciones de entrada en el Dashboard.

---
*Parte del ecosistema Soporte Bot — Gestiona con eficiencia.*
