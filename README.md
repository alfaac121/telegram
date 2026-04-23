# 🤖 Telegram Support Bot & Admin Panel

Bienvenido al repositorio del **Bot de Soporte Técnico para Telegram**. Este sistema permite gestionar reportes de fallas de usuarios finales a través de Telegram y administrarlos mediante un panel web profesional.

---

## 🚀 Guía Rápida de Instalación

### 1. Requisitos Previos
- **Node.js** (v18 o superior)
- **MySQL** (XAMPP o servidor local)
- **Un Bot de Telegram** (Creado mediante [@BotFather](https://t.me/botfather))

### 2. Instalación de Dependencias
Ejecuta en la carpeta raíz:
```bash
npm install express cors node-telegram-bot-api mysql2 jsonwebtoken bcryptjs node-fetch@2
```

### 3. Configuración de Base de Datos
Importa el contenido de el archivo `setup.sql` en tu servidor MySQL. Esto creará la base de datos `telegram_bot` y las tablas necesarias (`reportes`, `usuarios`, `clientes_telegram`).

### 4. Configuración del Bot
Edita el archivo `server.js` y coloca tu Token de Telegram:
```javascript
const TOKEN = 'TU_TOKEN_DE_TELEGRAM_AQUI';
const bot = new TelegramBot(TOKEN, { polling: true });
```

### 5. Iniciar el Sistema
```bash
npm start
```

---

## 📂 Estructura del Proyecto Explicada

- **`server.js`**: El corazón del sistema. Inicia el servidor Express y el Bot de Telegram simultáneamente.
- **`src/bot/telegramBot.js`**: Aquí reside toda la lógica de conversación del bot.
- **`src/config/db.js`**: Configuración de la conexión a MySQL (Host, Usuario, Password).
- **`src/routes/`**: Define los puntos de acceso (endpoints) para el panel web (Reportes, Auth, Usuarios).
- **`frontend/`**: Contiene la interfaz administrativa (HTML/JS) que consume la API del servidor.

---

## 🛠️ Código

### 1. Manejo de Reportes en el Bot
El bot utiliza un sistema de "Pasos" para guiar al usuario. Cuando el usuario escribe `/reportar`, el código activa una máquina de estados:

```javascript
// Fragmento de src/bot/telegramBot.js
if (estado.paso === 'esperando_punto') {
    estado.punto = texto; 
    estado.paso = 'esperando_falla';
    return bot.sendMessage(chatId, 'Describe la falla');
}
```
*Explicación:* Guardamos temporalmente lo que dice el usuario (`estado.punto`) y cambiamos al siguiente paso (`esperando_falla`) hasta completar el ticket.

### 2. Conexión a la Base de Datos
Utilizamos `mysql2` con soporte de Promesas para facilitar la lectura/escritura asíncrona:

```javascript
// Fragmento de src/config/db.js
const conexion = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '', // Cambiar según tu configuración
  database: 'telegram_bot'
});
```

### 3. Middleware de Seguridad (JWT)
Para proteger el panel administrativo, verificamos que cada petición tenga un Token válido:

```javascript
// Fragmento de src/middlewares/authMiddleware.js
const token = req.headers['authorization'];
if (!token) return res.status(403).send({ message: "No token provided" });
// Verificación del token con secreto...
```

### 4. Integración API en React (Frontend)
El frontend utiliza `fetch` para comunicarse con el backend, enviando el token JWT en las cabeceras para validar la sesión:

```javascript
// Fragmento de frontend/src/App.jsx
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:3000/api/auth/me', { 
      headers: { 'Authorization': `Bearer ${token}` } 
    })
    .then(r => r.ok ? r.json() : Promise.reject('Inválido'))
    .then(data => setUser({ ...data.user, permisos: data.permisos }))
    .catch(() => localStorage.removeItem('token'));
  }
}, []);
```
*Explicación:* Al cargar la app, verificamos si existe un token. Si es así, pedimos al servidor los datos del usuario y sus permisos de acceso a módulos específicos.

### 5. Manejo de Imágenes de Evidencia en el Bot
Cuando un usuario envía una foto, el bot extrae el ID del archivo de mayor resolución para guardarlo en la base de datos:

```javascript
// Fragmento de src/bot/telegramBot.js
const foto = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;

if (estado.paso === 'esperando_imagen') {
    if (foto) estado.imagen = foto;
    else if (texto.toLowerCase() === 'omitir') estado.imagen = null;
    
    estado.paso = 'confirmando';
    return enviarConfirmacion(chatId, estado);
}
```
*Explicación:* Telegram envía las fotos en diferentes tamaños. Accedemos al último elemento del array `msg.photo` para asegurarnos de tener la mejor calidad disponible.

### 6. Rutas Protegidas en el Panel (Frontend)
Usamos un componente de "Protección" para evitar que usuarios no autenticados entren a las vistas administrativas:

```javascript
// Fragmento de frontend/src/App.jsx
const ProtectedRoute = ({ children, user }) => {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 p-8 overflow-auto">
        {children}
      </div>
    </div>
  );
};
```

### 7. Control de Acceso por Roles (RBAC) en Backend
La lógica de negocio asegura que los Técnicos solo vean sus tickets asignados mientras que los Admins ven todo:

```javascript
// Fragmento de src/services/reportesService.js
exports.obtenerTodos = async (rol, username) => {
  if (rol === 'tecnico') {
    // El técnico solo consulta sus propios tickets
    const [rows] = await db.query('SELECT * FROM reportes WHERE tecnico = ? ORDER BY fecha DESC', [username]);
    return rows;
  }
  // Los demás (Admin/Supervisor) ven la lista global
  const [rows] = await db.query('SELECT * FROM reportes ORDER BY fecha DESC');
  return rows;
};
```

---

## 🛠️ Guía Paso a Paso (Tutorial de Configuración)

Sigue estos pasos según tu situación actual:

### Escenario A: Si estás instalando desde CERO (Primera vez)
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/alfaac121/telegram-bot.git
   cd telegram-bot
   ```
2. **Instalar Backend:**
   ```bash
   npm install
   ```
3. **Instalar Frontend (Opcional si vas a compilar):**
   ```bash
   cd frontend && npm install && cd ..
   ```
4. **Configurar Base de Datos:**
   - Abre XAMPP o MySQL.
   - Ejecuta los comandos en `setup.sql` para crear las tablas.
5. **Configurar el Bot:**
   - Edita `server.js` y coloca tu Token.
6. **Lanzar:**
   ```bash
   npm start
   ```

### Escenario B: Si ya tienes el código y quieres ACTUALIZARLO
1. **Bajar cambios de GitHub:**
   ```bash
   git pull origin main
   ```
2. **Reiniciar el servidor:**
   - Presiona `CTRL + C` en la terminal.
   - Escribe `npm start`.

### Escenario C: Si necesitas REINICIAR los datos (Limpiar todo)
1. **Entrar a MySQL y borrar base de datos:**
   ```sql
   DROP DATABASE telegram_bot;
   ```
2. **Recargar el script de tablas:**
   - Ejecuta de nuevo `setup.sql`.
3. **Iniciar servidor:**
   - El sistema creará automáticamente el usuario `admin@admin.com` al detectar que la tabla de usuarios está vacía.

---

## ⭐ Funcionalidades Destacadas

1.  **Evidencia con Fotos**: Los usuarios pueden enviar fotos de la falla. El bot captura el `file_id` y lo asocia al ticket para que el administrador lo vea en el panel.
2.  **Seguridad por ID**: Solo el usuario que creó el ticket puede consultar su estado mediante `/estado`.
3.  **Roles Administrativos**:
    - **Admin**: Control total y gestión de usuarios.
    - **Técnico**: Gestiona sus tareas asignadas y cambia estados.
    - **Supervisor**: Vista de solo lectura para auditoría y métricas.

---

## 🚀 Notas Técnicas y Seguridad
- **JWT**: Las sesiones expiran y requieren un secreto configurado en `src/config/env.js`.
- **Bcrypt**: Las contraseñas nunca se guardan en texto plano; se cifran con un hash de costo 10.
- **Admin Maestro**: En caso de inicializar de cero, usa:
  - **Email:** `admin@admin.com`
  - **Password:** `123456`

---
*Documentación avanzada para la estabilidad empresarial y gestión de soporte.*
