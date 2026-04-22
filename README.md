# Telegram Soporte Bot & Panel Administrativo

Este documento contiene un resumen en vivo de toda la arquitectura y cambios implementados hasta el día de hoy, para asegurar la continuidad perfecta del proyecto en futuras sesiones.

## 🛠️ Tecnologías Establecidas
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MySQL (mysql2 driver local a `127.0.0.1`).
- **Seguridad:** JWT (Json Web Tokens) para las sesiones y BcryptJS para el cifrado de contraseñas.
- **Bot:** Telegram Bot API (node-telegram-bot-api).

## ⭐ Funcionalidades Completadas Hoy

**1. Interfaz del Bot de Telegram (`bot.js`)**
- **Atajos Nativos:** Añadimos funcionalidad en el botón lateral del teclado (`/start`, `/reportar`, `/estado`) para agilizar flujos.
- **Evidencia con Fotos:** El bot comprende la llegada de imágenes enviadas por el usuario, detectando el ID directo del archivo de alta resolución de Telegram sin que caiga el sistema, guardándolo asociado a su ticket.
- **Seguridad de Consultas:** Al pedir el `/estado`, el bot cruza el ID del telegram del usuario con la Base de datos para evitar que los reportes ajenos sean robados.

**2. Base de datos MySQL (`setup.sql` & Esquema)**
- **Tabla `usuarios`:** Para el histórico publico de clientes de Telegram y guardado dinámico (UPSERT)
- **Tabla `reportes`:** Modificada mediante comandos ALTER para añadir la validación de `tecnico` y su carga multimedia `imagen`. 
- **Tabla `panel_usuarios`:** Creada para desacoplar a los empleados del sistema frente a los clientes externos.

**3. Panel Web Interactivo (UI & Autenticación)**
- **Dashboard Flat Design:** Estético dashboard programado en HTML Vanilla y JS del lado de cliente (`index.html` & `app.js`).
- **Seguridad LogIn:** Implementación de JWT. Redirige a los no autorizados a `/login.html` denegando Fetch APIs sin el Bearer Token.
- **Ruta de Proxy para Fotos:** Desarrollamos un *bypass* (`GET /api/reportes/:id/imagen`) que impide la caducidad global y fuerza las imágenes (`inline content-disposition`) sin obligar a descargar el archivo al PC.

**4. Reglas de Negocio Multiusuario (RBAC)**
- **Admin**: Acceso incondicional, ve la vista completa.
- **Técnico**: Ve su lista asignada, se inhabilitan cajas de asignar nuevo técnico, pero mantiene capacidades de modificar estados a ticket Resueltos.
- **Supervisor**: Ingresa, puede ver imágenes, métricas... pero nada es editable (Vista Control de Lectura).

---
## 🚀 Notas para la próxima sesión
- **Inicializador:** En caso de purga de Base de Datos, con solo levantar `node index.js`, el aplicativo incrustará sin preguntar la cuenta matriz `admin@admin.com / 123456`.
- Todo el entorno ha quedado validado con cero errores a nivel conexión. 
- *Proceso listado para continuar mañana.*
# bot_telegram
