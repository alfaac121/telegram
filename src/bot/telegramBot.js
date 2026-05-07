/**
 * Bot de Telegram — Handlers para múltiples áreas organizacionales
 */
const fetch = require('node-fetch');
const API_URL = 'http://localhost:3000/api/bot';

const users = {};

const AREAS = {
  soporte_ti: 'Soporte TI',
  comercial: 'Comercial',
  auditoria: 'Auditoría',
  contabilidad: 'Contabilidad',
  talento_humano: 'Talento Humano',
  otros: 'Otros servicios'
};

function obtenerSaludo() {
  const hora = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false });
  const h = parseInt(hora, 10);
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function registrarHandlers(bot) {
  // --- MENU PRINCIPAL ---
  function mostrarMenuPrincipal(chatId) {
    delete users[chatId];
    bot.sendMessage(chatId, `${obtenerSaludo()}, bienvenido al Centro de Servicios Integrados. Por favor, selecciona el área con la que deseas comunicarte:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💻 Soporte TI', callback_data: 'area_soporte_ti' }, { text: '📈 Comercial', callback_data: 'area_comercial' }],
          [{ text: '🔍 Auditoría', callback_data: 'area_auditoria' }, { text: '📒 Contabilidad', callback_data: 'area_contabilidad' }],
          [{ text: '👥 Talento Humano', callback_data: 'area_talento_humano' }, { text: '⚙️ Otros servicios', callback_data: 'area_otros' }]
        ]
      }
    });
  }

  // --- SUBMENÚS POR ÁREA ---
  function mostrarSubmenu(chatId, areaKey) {
    const areaNombre = AREAS[areaKey];
    users[chatId] = { area: areaNombre, areaKey: areaKey };
    
    let opciones = [];
    if (areaKey === 'soporte_ti') {
      opciones = [
        [{ text: '🛑 Reportar falla', callback_data: 'accion_reportar' }],
        [{ text: '🔍 Consultar estado', callback_data: 'accion_estado' }],
        [{ text: '⬅️ Volver', callback_data: 'volver_principal' }]
      ];
    } else {
      opciones = [
        [{ text: '📝 Registrar solicitud', callback_data: 'accion_reportar' }],
        [{ text: '🔍 Consultar estado', callback_data: 'accion_estado' }],
        [{ text: '⬅️ Volver', callback_data: 'volver_principal' }]
      ];
    }

    bot.sendMessage(chatId, `📍 Has seleccionado: *${areaNombre}*\n¿Qué deseas hacer?`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: opciones }
    });
  }

  bot.onText(/\/start/, (msg) => {
    mostrarMenuPrincipal(msg.chat.id);
  });

  bot.onText(/\/menu/, (msg) => {
    mostrarMenuPrincipal(msg.chat.id);
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    bot.answerCallbackQuery(query.id).catch(() => {});

    if (data.startsWith('area_')) {
      const areaKey = data.replace('area_', '');
      mostrarSubmenu(chatId, areaKey);
      return;
    }

    if (data === 'volver_principal') {
      mostrarMenuPrincipal(chatId);
      return;
    }

    if (data === 'accion_reportar') {
      const area = users[chatId]?.area || 'Soporte TI';
      users[chatId] = { ...users[chatId], paso: 'esperando_punto', punto: '', falla: '', asesora: '', imagen: null };
      bot.sendMessage(chatId, `Iniciando reporte para *${area}*.\n\n¿Cuál es el punto de venta o sucursal?`, { parse_mode: 'Markdown' });
      return;
    }

    if (data === 'accion_estado') {
      users[chatId] = { ...users[chatId], paso: 'esperando_ticket' };
      bot.sendMessage(chatId, 'Ingresa tu número de ticket para consultar el estado:');
      return;
    }

    if (data === 'confirmar_si') {
      const estado = users[chatId];
      if (!estado || estado.paso !== 'confirmando') return;
      try {
        const res = await fetch(`${API_URL}/reportes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: chatId,
            area: estado.area,
            punto: estado.punto,
            falla: estado.falla,
            asesora: estado.asesora || null,
            imagen: estado.imagen || null
          })
        });
        const result = await res.json();
        if (!res.ok) throw new Error('Error de API');
        bot.sendMessage(chatId, `✅ Registro guardado correctamente en *${estado.area}*\n\n🎫 Tu ticket es: #${result.id}\n\nConsérvalo para futuras consultas.`, {
          parse_mode: 'Markdown',
          reply_markup: { 
            inline_keyboard: [
              [{ text: '🔍 Consultar estado', callback_data: 'accion_estado' }],
              [{ text: '🏠 Volver al inicio', callback_data: 'volver_principal' }]
            ] 
          }
        });
      } catch (e) {
        bot.sendMessage(chatId, '⚠️ Error al guardar el reporte. Intenta de nuevo.');
      }
      delete users[chatId];
      return;
    }

    if (data === 'confirmar_no') {
      const areaKey = users[chatId]?.areaKey;
      if (areaKey) mostrarSubmenu(chatId, areaKey);
      else mostrarMenuPrincipal(chatId);
      return;
    }

    if (data === 'editar_punto')   { users[chatId].paso = 'editando_punto';   bot.sendMessage(chatId, '✏️ Escribe el nuevo PUNTO:');  return; }
    if (data === 'editar_falla')   { users[chatId].paso = 'editando_falla';   bot.sendMessage(chatId, '✏️ Escribe la nueva DESCRIPCIÓN:');  return; }
    if (data === 'editar_asesora') { users[chatId].paso = 'editando_asesora'; bot.sendMessage(chatId, '✏️ Escribe el nuevo número de contacto o escribe "omitir":'); return; }
    if (data === 'editar_imagen')  { users[chatId].paso = 'editando_imagen';  bot.sendMessage(chatId, "✏️ Envía la nueva imagen o escribe 'omitir':"); return; }
  });

  bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const texto = (msg.text || '').trim();
    const foto = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
    const usuario = msg.from.first_name || 'usuario';
    const estado = users[chatId];

    // Registro silencioso de interacción
    fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: msg.from.id, nombre: usuario, punto: estado ? estado.punto : null, descripcion: texto })
    }).catch(e => console.error('Error registrando usuario:', e));

    if (!texto && !foto) return;
    if (!estado) return bot.sendMessage(chatId, 'Hola 👋 Escribe /start para ver el menú de áreas.');

    // ── Flujo de reporte ─────────────────────────────────────────

    if (estado.paso === 'esperando_punto') {
      estado.punto = texto;
      estado.paso = 'esperando_falla';
      const label = estado.area === 'Soporte TI' ? 'la falla' : 'tu solicitud';
      return bot.sendMessage(chatId, `Describe detalladamente ${label}:`);
    }

    if (estado.paso === 'esperando_falla') {
      if (foto) return bot.sendMessage(chatId, '⚠️ Por favor describe la situación con texto.');
      estado.falla = texto;
      estado.paso = 'esperando_asesora';
      return bot.sendMessage(chatId, '📞 ¿Cuál es tu número de contacto? (o escribe "omitir")');
    }

    if (estado.paso === 'esperando_asesora') {
      if (foto) return bot.sendMessage(chatId, '⚠️ Por favor escribe el número o "omitir".');
      estado.asesora = texto.toLowerCase() === 'omitir' ? '' : texto;
      estado.paso = 'esperando_imagen';
      return bot.sendMessage(chatId, "📎 Puedes enviar una imagen como evidencia (opcional) o escribe 'omitir'");
    }

    if (estado.paso === 'esperando_imagen') {
      if (foto) estado.imagen = foto;
      else if (texto && texto.toLowerCase() === 'omitir') estado.imagen = null;
      else if (!foto) return bot.sendMessage(chatId, "⚠️ Por favor envía una imagen o escribe 'omitir'.");
      
      estado.paso = 'confirmando';
      return enviarConfirmacion(chatId, estado);
    }

    // ── Edición de campos ────────────────────────────────────────

    if (['editando_punto', 'editando_falla', 'editando_asesora', 'editando_imagen'].includes(estado.paso)) {
      if (estado.paso === 'editando_punto')   estado.punto   = texto;
      if (estado.paso === 'editando_falla')   estado.falla   = texto;
      if (estado.paso === 'editando_asesora') estado.asesora = texto.toLowerCase() === 'omitir' ? '' : texto;
      if (estado.paso === 'editando_imagen') {
        if (foto) estado.imagen = foto;
        else if (texto && texto.toLowerCase() === 'omitir') estado.imagen = null;
        else return bot.sendMessage(chatId, "⚠️ Envía una imagen o escribe 'omitir'.");
      }
      estado.paso = 'confirmando';
      return enviarConfirmacion(chatId, estado);
    }

    // ── Confirmación visual ──────────────────────────────────────

    function enviarConfirmacion(idChat, dataEstado) {
      const contactLine = dataEstado.asesora ? `\n📞 Contacto: ${dataEstado.asesora}` : '';
      const tieneImg = dataEstado.imagen ? '\n🖼️ [Evidencia adjunta]' : '';
      const label = dataEstado.area === 'Soporte TI' ? 'Falla' : 'Solicitud';

      bot.sendMessage(idChat,
        `📋 *Confirmación de Solicitud*\n\n*Área:* ${dataEstado.area}\n*Punto:* ${dataEstado.punto}\n*${label}:* ${dataEstado.falla}${contactLine}${tieneImg}\n\n¿La información es correcta?`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Sí, enviar', callback_data: 'confirmar_si' }],
              [{ text: '✏️ Editar Punto', callback_data: 'editar_punto' }, { text: '✏️ Editar Contenido', callback_data: 'editar_falla' }],
              [{ text: '✏️ Editar Contacto', callback_data: 'editar_asesora' }, { text: '✏️ Editar Imagen', callback_data: 'editar_imagen' }],
              [{ text: '❌ Cancelar', callback_data: 'confirmar_no' }],
            ]
          }
        }
      );
    }

    // ── Consulta de ticket ───────────────────────────────────────

    if (estado.paso === 'esperando_ticket') {
      if (!/^\d+$/.test(texto)) return bot.sendMessage(chatId, '❌ Ingresa un número de ticket válido');
      try {
        const res = await fetch(`${API_URL}/reportes/${texto}`);
        const r = await res.json();
        if (r && r.id) {
          if (String(r.user_id) !== String(chatId)) {
            bot.sendMessage(chatId, `🚫 Acceso denegado: Este ticket no fue registrado con tu cuenta.`);
          } else {
            const fechaFormat = new Date(r.fecha).toLocaleString('es-CO');
            const asesoraLine = r.asesora ? `\n📞 Contacto: ${r.asesora}` : '';
            const areaLine = r.area ? `\n📍 Área: ${r.area}` : '';
            bot.sendMessage(chatId, `📄 *Estado del Ticket #${r.id}*${areaLine}\n*Punto:* ${r.punto}\n*Descripción:* ${r.falla}${asesoraLine}\n*Estado:* ${r.estado}\n*Técnico:* ${r.tecnico || 'No asignado'}\n*Fecha:* ${fechaFormat}`, { parse_mode: 'Markdown' });
          }
        } else {
          const res2 = await fetch(`${API_URL}/usuarios/${chatId}/reportes`);
          const ultimos = await res2.json();
          let msj = `❌ No se encontró el ticket #${texto}`;
          if (ultimos && ultimos.length > 0) msj += `\n\nTus últimos tickets son:\n` + ultimos.map(t => `#${t.id}`).join(', ');
          bot.sendMessage(chatId, msj);
        }
      } catch (e) {
        bot.sendMessage(chatId, '⚠️ Error al consultar el ticket.');
      } finally {
        const currentAreaKey = estado.areaKey;
        if (currentAreaKey) mostrarSubmenu(chatId, currentAreaKey);
        else mostrarMenuPrincipal(chatId);
      }
    }
  });

  bot.on('polling_error', console.error);
}

module.exports = { registrarHandlers };
