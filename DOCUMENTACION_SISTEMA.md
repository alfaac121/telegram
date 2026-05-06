# 📘 Documentación Absoluta del Sistema — v3

## 1. Arquitectura General
El sistema es una plataforma de gestión de tickets de soporte técnico integrada con Telegram.

- **Backend**: Node.js con Express, utilizando un bot de Telegram integrado para la captura de incidentes.
- **Frontend**: React + Vite con un diseño basado en componentes modulares y rutas protegidas.
- **Base de Datos**: MySQL 8.0 gestionada mediante Docker.

---

## 2. Servicios y Estado Actual

| Servicio | Puerto | Estado | Descripción |
|---|---|---|---|
| **API Backend** | 3000 | ✅ Activo | Procesa autenticación, reportes y lógica del bot. |
| **Frontend UI** | 5173 | ✅ Activo | Dashboard administrativo y visualización de tickets. |
| **Telegram Bot** | N/A | ✅ Activo | Interfaz de usuario para reportar fallas y consultar estados. |
| **MySQL DB** | 3306 | ✅ Activo | Almacenamiento persistente de usuarios, tickets y configuración. |

---

## 3. Módulos Operativos (Hub Central)

### Gestión de Soporte
- **Dashboard (`/`)**: Estadísticas en tiempo real de tickets pendientes vs resueltos.
- **Tabla de Tickets (`/soporte/tickets`)**: Gestión completa (Asignación de técnico, cambio de estado, visualización de evidencia).
- **ManageEngine (`/soporte/manageengine`)**: Integración vía Iframe del sistema ServiceDesk Plus.

### Integraciones Externas (Operaciones)
- **BNET**: Acceso a sistema de red.
- **SIIS**: Sistema de información (Anteriormente SIMS).
- **Bet Bogotá**: Nuevo módulo operativo local.
- **Benet Yumbo**: Nuevo módulo operativo regional.

---

## 4. Flujo del Bot de Telegram
El bot guía al usuario a través de un árbol de decisiones:
1. **Comando `/start`**: Inicia el flujo.
2. **Reporte**: Solicita Punto, Falla, Teléfono de Asesora (opcional) e Imagen (opcional).
3. **Confirmación**: Permite editar los datos antes de enviar.
4. **Persistencia**: El ticket se guarda en la DB y genera un ID único.

---

## 5. Roles y Permisos
- **Admin**: Acceso total, puede asignar técnicos y modificar cualquier ticket.
- **Técnico**: Puede ver y gestionar solo los tickets que tiene asignados.
- **Supervisor**: Acceso de solo lectura a todos los módulos.

---

## 6. Configuración e Infraestructura
El proyecto está completamente Dockerizado.
- `docker-compose.yml`: Define los servicios `db`, `app` (backend) y `frontend`.
- `fix_admin.js`: Script de utilidad para recuperar acceso administrativo.

---

## 7. Pendientes / En Desarrollo 🚧
- **Gestión de Usuarios (`/admin/usuarios`)**: La ruta existe pero el panel visual está pendiente de implementación.
- **Notificaciones Push**: Integración de avisos en tiempo real en el Hub Central cuando entra un ticket nuevo.
