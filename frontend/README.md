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
Por defecto, el frontend busca el servidor en `http://localhost:3000`. Si cambias el puerto del backend, debes actualizar las URLs en:
- `src/App.jsx`
- `src/pages/Login.jsx`
- `src/pages/TicketTable.jsx`

### 3. Comandos de Terminal
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo (hace cambios en vivo). |
| `npm run build` | Genera la carpeta `dist/` lista para subir a producción (Vercel, Netlify). |
| `npm run preview` | Previsualiza la versión de producción localmente. |

---

## 📂 Organización del Código

- **`src/components/`**: Elementos reutilizables como el `Sidebar` (barra lateral) y módulos externos.
- **`src/pages/`**: Vistas principales de la aplicación:
  - `Login.jsx`: Control de acceso con JWT.
  - `Dashboard.jsx`: Resumen visual con tarjetas de estado y gráficos.
  - `TicketTable.jsx`: Tabla interactiva para asignar técnicos y cambiar estados.
- **`src/assets/`**: Imágenes y recursos estáticos.

---

## 🔐 Seguridad y Autenticación
El panel utiliza **JSON Web Tokens (JWT)**:
1. El usuario se loguea y el servidor devuelve un token.
2. El token se guarda en el `localStorage` del navegador.
3. El frontend envía este token en el Header `Authorization` en cada petición API.
4. Si el token es inválido o expira, la app redirige automáticamente al `/login`.

---

## 🎨 Diseño y UX
- **Flat UI:** Interfaz limpia con sombras sutiles y bordes redondeados.
- **Responsive:** Adaptado para tablets y pantallas de escritorio.
- **Micro-interacciones:** Efectos hover en botones y transiciones de carga suaves.

---
*Parte del ecosistema Soporte Bot — Gestiona con eficiencia.*
