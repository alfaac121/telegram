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

## 🛠️ Código Explicado (Snippets Clave)

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

---

## ⭐ Funcionalidades Destacadas

1.  **Evidencia con Fotos**: Los usuarios pueden enviar fotos de la falla. El bot captura el `file_id` y lo asocia al ticket para que el administrador lo vea en el panel.
2.  **Seguridad por ID**: Solo el usuario que creó el ticket puede consultar su estado mediante `/estado`.
3.  **Roles Administrativos**:
    - **Admin**: Control total.
    - **Técnico**: Gestiona sus tareas asignadas.
    - **Supervisor**: Vista de solo lectura para auditoría.

---

## 🚀 Notas Técnicas
En caso de reiniciar la base de datos, el sistema creará automáticamente la cuenta de administrador maestra si ejecutas el servidor por primera vez:
- **Email:** `admin@admin.com`
- **Password:** `123456`

---
*Desarrollado para el soporte técnico inteligente vía Telegram.*
