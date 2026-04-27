# 🤖 Telegram Bot — Hub Central de Soporte

Sistema integral de gestión de tickets de soporte técnico con bot de Telegram y portal web administrativo.

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Node.js + Express |
| **Base de Datos** | MySQL 8.0 (Docker) |
| **Frontend** | React + Vite + TailwindCSS |
| **Bot** | node-telegram-bot-api |
| **Auth** | bcrypt + JWT |
| **Infra** | Docker Compose |

---

## 🚀 Levantar el sistema

```bash
# Clonar el repositorio
git clone <repo-url>
cd telegram

# Levantar todos los servicios
docker compose up -d

# Crear usuario admin (primera vez)
docker exec telegram_bot_app node fix_admin.js
```

### Servicios disponibles

| Servicio | URL |
|---|---|
| **Hub Central (Frontend)** | http://localhost:5173 |
| **API Backend** | http://localhost:3000 |
| **MySQL** | localhost:3306 (interno) |

### Credenciales por defecto

| Campo | Valor |
|---|---|
| Email | `admin@admin.com` |
| Password | `123456` |

---

## 📁 Estructura del proyecto

```
telegram/
├── server.js                  # Punto de entrada del backend
├── setup.sql                  # Schema inicial de la base de datos
├── fix_admin.js               # Script para crear/resetear usuario admin
├── docker-compose.yml
├── Dockerfile
│
├── src/
│   ├── bot/
│   │   └── telegramBot.js     # Handlers del bot de Telegram
│   ├── config/
│   │   ├── db.js              # Pool de conexión MySQL (promise)
│   │   └── env.js             # Variables de entorno
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── botController.js
│   │   ├── configController.js
│   │   ├── reportesController.js
│   │   └── usuariosController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js  # Verificación JWT
│   │   └── roleMiddleware.js  # Control de roles
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── botRoutes.js
│   │   ├── configRoutes.js
│   │   ├── reportesRoutes.js
│   │   └── usuariosRoutes.js
│   └── services/
│       ├── authService.js
│       ├── configService.js
│       ├── reportesService.js
│       └── usuariosService.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx   # Estadísticas en tiempo real
        │   ├── TicketTable.jsx # Gestión de tickets
        │   └── Login.jsx
        └── components/
            ├── Sidebar.jsx
            └── ExternalModule.jsx  # Wrapper para sistemas externos (iframe)
```

---

## 🗄️ Esquema de Base de Datos

```sql
-- Usuarios del portal web
usuarios (id, username, email, password, rol)
  rol: 'admin' | 'tecnico' | 'supervisor'

-- Clientes que usan el bot de Telegram
clientes_telegram (id, telegram_id, nombre, punto, descripcion, fecha_registro)

-- Tickets de soporte generados desde el bot
reportes (id, user_id, punto, falla, estado, tecnico, asesora, imagen, fecha)
  estado: 'pendiente' | 'en_proceso' | 'resuelto'

-- Módulos del sistema
modulos (id, nombre)

-- Permisos por usuario
permisos (id_usuario, id_modulo)

-- Configuración dinámica del sistema
configuracion (clave, valor)
```

---

## 🤖 Flujo del Bot de Telegram

```
/start
  └─► 🛑 Reportar falla
        ├─► ¿Cuál es el punto?
        ├─► Describe la falla
        ├─► 📞 ¿Número de la asesora? (o "omitir")
        ├─► 📎 Imagen de evidencia (o "omitir")
        ├─► 📋 Confirmación con opciones de edición
        └─► ✅ Ticket guardado con número de ID

/estado → Consultar estado de un ticket por ID
/reportar → Iniciar reporte directamente
```

---

## 🖥️ Hub Central — Portal Web

### Módulos disponibles

| Ruta | Descripción | Roles |
|---|---|---|
| `/` | Dashboard con estadísticas y gráfica | Todos |
| `/soporte/tickets` | Tabla de tickets con gestión | Admin, Técnico |
| `/soporte/manageengine` | Integración ManageEngine ServiceDesk | Todos |
| `/operaciones/bnet` | Sistema BNET | Todos |
| `/operaciones/sims` | Sistema SIMS | Todos |
| `/personal/traslados` | Módulo de traslados | Todos |
| `/personal/sis` | Sistema SIS | Todos |

### Gestión de tickets

- **Admin**: puede asignar técnico (campo editable con Enter o clic fuera), cambiar estado, ver todos los tickets
- **Técnico**: ve solo sus tickets asignados, puede cambiar estado
- **Supervisor**: solo lectura

---

## 🔧 Correcciones y Mejoras Realizadas

### 🐛 Bug crítico — Error 500 en login (resuelto)

**Causa**: `db.js` exportaba `pool.promise()` directamente, pero todos los servicios hacían `require('../config/db').promise`, accediendo a una propiedad inexistente (`undefined`). Cualquier llamada a `db.query()` lanzaba un `TypeError` capturado como error 500.

**Archivos corregidos**:
- `src/services/authService.js`
- `src/services/reportesService.js`
- `src/services/usuariosService.js`
- `src/controllers/botController.js`
- `fix_admin.js` (también usaba `bcryptjs` en lugar de `bcrypt`)

### ✅ Campo "Asesora" en reportes

- El bot ahora pide el número de teléfono de la asesora como paso del flujo de reporte
- El campo es editable en la pantalla de confirmación
- Se guarda en la columna `asesora` de la tabla `reportes`
- El Hub Central muestra el número en la tabla de tickets como enlace `tel:` clickeable

### ✅ Técnico — guardar con Enter

- El campo de asignación de técnico en la tabla de tickets ahora guarda tanto al presionar **Enter** como al hacer clic fuera del campo

### ✅ Integración ManageEngine

- URL configurada: `http://10.98.98.30:8443/WorkOrder.do`
- Carga embebida en iframe dentro del Hub Central
- Fallback automático con botón "Abrir en pestaña" si el sistema bloquea el embed
- Atributo `sandbox` removido para permitir carga completa de estilos y scripts

### ✅ Infraestructura Docker

- Corrección de `fix_admin.js` para ejecutarse correctamente dentro del contenedor
- `setup.sql` actualizado con columna `asesora` y tabla `configuracion`

---

## 🔐 Variables de entorno

Configuradas en `docker-compose.yml`:

```env
DB_HOST=db
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=telegram_bot
JWT_SECRET=secreto-seguro-telegram-bot
PORT=3000
```

---

## 📌 Comandos útiles

```bash
# Apagar todos los servicios
docker compose down

# Levantar servicios
docker compose up -d

# Ver logs del backend
docker logs telegram_bot_app --tail 50

# Ver logs del frontend
docker logs telegram_bot_frontend --tail 50

# Resetear usuario admin
docker exec telegram_bot_app node fix_admin.js

# Acceder a MySQL
docker exec -it telegram_bot_db mysql -uroot -prootpassword telegram_bot
```
