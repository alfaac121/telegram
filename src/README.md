# ⚙️ Estructura del Backend (Carpeta `src`)

Esta carpeta contiene toda la lógica de negocio, conexiones a bases de datos y la inteligencia del bot de Telegram. Está organizada siguiendo el patrón **MVC (Modelo-Vista-Controlador)** para facilitar el mantenimiento.

---

## 📂 Organización de Subcarpetas

### 1. `config/` (Configuraciones)
Aquí se definen las conexiones externas.
- **`db.js`**: Conexión a MySQL usando el pool de conexiones.
- **`env.js`**: Variables globales (Puerto, Secretos).
```javascript
// Ejemplo de db.js
const conexion = mysql.createConnection({ host: '127.0.0.1', ... });
```

### 2. `bot/` (Cerebro de Telegram)
Contiene los "Handlers" o manejadores de mensajes.
- **`telegramBot.js`**: Define qué pasa cuando alguien escribe `/start` o envía una foto.
```javascript
// Ejemplo: Definición de comandos
bot.onText(/\/start/, (msg) => { ... });
```

### 3. `routes/` (Puertas de la API)
Define las URLs que el panel web (frontend) puede consultar.
- **`reportesRoutes.js`**: Rutas para ver, filtrar y editar tickets.
```javascript
// Ejemplo: Ruta protegida por token
router.get('/', verificarToken, reportesController.getReportes);
```

### 4. `controllers/` (Lógica de Ruta)
Recibe la petición del usuario, llama al servicio y devuelve una respuesta (JSON).
- **`authController.js`**: Maneja el Login y el perfil del usuario.

### 5. `services/` (Lógica de Base de Datos)
Aquí están las consultas SQL puras. Ningún otro archivo debería tocar la base de datos directamente.
- **`reportesService.js`**: `SELECT * FROM reportes...`

### 6. `middlewares/` (Filtros de Seguridad)
Funciones que se ejecutan **antes** de llegar al controlador.
- **`authMiddleware.js`**: Valida que el JWT sea correcto.
- **`roleMiddleware.js`**: Verifica si el usuario es Admin o Técnico antes de permitirle editar.

---

## 🛠️ Cómo agregar una nueva Funcionalidad
Si quieres añadir una nueva opción al bot o al panel:
1. Crea la tabla en la DB (si es necesario).
2. Crea el **Service** con la consulta SQL.
3. Crea el **Controller** para manejar la respuesta.
4. Define la **Route** para que el frontend pueda llegar a ella.
5. (Opcional) Agrega el comando en `src/bot/telegramBot.js`.

---
*Arquitectura Backend — Robusta y Escalable.*
