# 🤖 Telegram Support Bot & Admin Panel

Bienvenido al repositorio del **Bot de Soporte Técnico para Telegram**. Este sistema permite gestionar reportes de fallas de usuarios finales a través de Telegram y administrarlos mediante un panel web profesional.

---

## 🛠️ Manual de Construcción Desde Cero (Pasos Reales)

Si quieres replicar este proyecto en una computadora limpia o entender cómo se construyó de principio a fin, sigue este orden:

### Paso 1: Entorno de Desarrollo
Antes de tocar el código, debes tener:
1. **Node.js**: Descárgalo de [nodejs.org](https://nodejs.org/). Verifícalo con `node -v`.
2. **Servidor MySQL**: Instala [XAMPP](https://www.apachefriends.org/) y activa el módulo **MySQL**.
3. **Editor**: Se recomienda [VS Code](https://code.visualstudio.com/).

### Paso 2: Inicialización de la Carpeta y Proyecto
Crea la carpeta y el archivo de configuración base:
```bash
# Crear carpeta y entrar
mkdir telegram-bot
cd telegram-bot

# Inicializar proyecto de Node
npm init -y
```

### Paso 3: Instalación de la "Columna Vertebral" (Dependencias)
Ejecuta este comando para instalar todas las herramientas necesarias:
```bash
npm install express cors node-telegram-bot-api mysql2 jsonwebtoken bcryptjs node-fetch@2
```

### Paso 4: Creación de la Estructura de Archivos
Debes crear las carpetas organizadamente para que el código sea escalable:
```bash
mkdir -p src/bot src/config src/controllers src/middlewares src/routes src/services frontend
```

### Paso 5: Implementación de la Base de Datos
Crea un archivo llamado `setup.sql` y pega el código de creación de tablas. Luego, en tu terminal de MySQL o PHPMyAdmin ejecuta:
```sql
CREATE DATABASE telegram_bot;
USE telegram_bot;
-- (Aquí pegas las tablas de reportes, usuarios, etc.)
```

### Paso 6: Configuración del Bot de Telegram
1. Habla con [@BotFather](https://t.me/botfather) en Telegram.
2. Crea un bot nuevo con `/newbot`.
3. Copia el **HTTP API Token**.
4. Pégalo en tu archivo `server.js`.

### Paso 7: Ejecución
Para encender el sistema completo:
```bash
npm start
```

---

## 💻 Código Explicado Profundamente

### 1. El Servidor Maestro (`server.js`)
Este archivo une el mundo web con el mundo de Telegram:
```javascript
const app = express();
// ... configuración de rutas API ...
const bot = new TelegramBot(TOKEN, { polling: true }); // Enciende el bot
registrarHandlers(bot); // Carga la lógica de conversación
app.listen(PORT, () => console.log("Servidor Online"));
```

### 2. Lógica de Conversación (`src/bot/telegramBot.js`)
Aquí es donde el bot decide qué responder. Usamos un sistema de **Pasos** para que el bot no se confunda entre el nombre del cliente y la falla técnica:

```javascript
// Ejemplo de transición de estados
if (estado.paso === 'esperando_punto') {
    estado.punto = texto; // Guardamos el lugar de la falla
    estado.paso = 'esperando_falla'; // Pasamos a la siguiente pregunta
    bot.sendMessage(chatId, '¿Qué falla presenta el equipo?');
}
```

### 3. Control de Acceso por Roles (RBAC) en Backend
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
