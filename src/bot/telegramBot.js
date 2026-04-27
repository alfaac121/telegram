/**
 * Bot de Telegram — Handlers refactorizados para usar API HTTP
 */
const fetch = require('node-fetch');
const API_URL = 'http://localhost:3000/api/bot';

const users = {};

function obtenerSaludo() {
  const hora = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false });
  const h = parseInt(hora, 10);
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function registrarHandlers(bot) {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    delete users[chatId];
    bot.sendMessage(chatId, `${obtenerSaludo()}, bienvenido a tu soporte virtual ¿qué deseas hacer?`, {
      reply_markup: { inline_keyboard: [[{ text: '🛑 Reportar falla', callback_data: 'falla' }]] }
    });
  });

  bot.onText(/\/reportar/, (msg) => {
    users[msg.chat.id] = { paso: 'esperando_punto', punto: '', falla: '', asesora: '', imagen: null };
    bot.sendMessage(msg.chat.id, '¿Cuál es el punto?');
  });

  bot.onText(/\/estado/, (msg) => {
    users[msg.chat.id] = { paso: 'esperando_ticket' };
    bot.sendMessage(msg.chat.id, 'Ingresa tu número de ticket');
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    bot.answerCallbackQuery(query.id).catch(() => {});

    if (data === 'confirmar_si') {
      const estado = users[chatId];
      if (!estado || estado.paso !== 'confirmando') return;
      try {
        const res = await fetch(`${API_URL}/reportes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: chatId,
            punto: estado.punto,
            falla: estado.falla,
            asesora: estado.asesora || null,
            imagen: estado.imagen || null
          })
        });
        const result = await res.json();
        if (!res.ok) throw new Error('Error de API');
        bot.sendMessage(chatId, `✅ Reporte guardado correctamente\n\n🎫 Tu ticket es: #${result.id}\n\nGuárdalo para consultar el estado.`, {
          reply_markup: { inline_keyboard: [[{ text: '🔍 Consultar estado', callback_data: 'estado' }]] }
        });
      } catch (e) {
        bot.sendMessage(chatId, '⚠️ Error al guardar el reporte. Intenta de nuevo.');
      }
      delete users[chatId];
      return;
    }

    if (data === 'confirmar_no') {
      delete users[chatId];
      bot.sendMessage(chatId, '🚫 Reporte cancelado. Escribe /start para volver al menú.');
      return;
    }

    if (data === 'editar_punto')   { users[chatId].paso = 'editando_punto';   bot.sendMessage(chatId, '✏️ Escribe el nuevo PUNTO:');  return; }
    if (data === 'editar_falla')   { users[chatId].paso = 'editando_falla';   bot.sendMessage(chatId, '✏️ Escribe la nueva FALLA:');  return; }
    if (data === 'editar_asesora') { users[chatId].paso = 'editando_asesora'; bot.sendMessage(chatId, '✏️ Escribe el nuevo número de la asesora o escribe "omitir":'); return; }
    if (data === 'editar_imagen')  { users[chatId].paso = 'editando_imagen';  bot.sendMessage(chatId, "✏️ Envía la nueva imagen o escribe 'omitir':"); return; }

    switch (data) {
      case 'falla':
        users[chatId] = { paso: 'esperando_punto', punto: '', falla: '', asesora: '', imagen: null };
        bot.sendMessage(chatId, '¿Cuál es el punto?');
        break;
      case 'estado':
        users[chatId] = { paso: 'esperando_ticket' };
        bot.sendMessage(chatId, 'Ingresa tu número de ticket');
        break;
    }
  });

  bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const texto = (msg.text || '').trim();
    const foto = msg.photo ? msg.photo[msg.photo.length - 1].file_id : null;
    const usuario = msg.from.first_name || 'usuario';
    const estado = users[chatId];

    fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: msg.from.id, nombre: usuario, punto: estado ? estado.punto : null, descripcion: texto })
    }).catch(e => console.error(e));

    if (!texto && !foto) return bot.sendMessage(chatId, '⚠️ Mensaje vacío.');
    if (!estado) return bot.sendMessage(chatId, 'Hola 👋 Escribe /start para ver el menú.');

    // ── Flujo de reporte ─────────────────────────────────────────

    if (estado.paso === 'esperando_punto') {
      estado.punto = texto;
      estado.paso = 'esperando_falla';
      return bot.sendMessage(chatId, 'Describe la falla');
    }

    if (estado.paso === 'esperando_falla') {
      if (foto) return bot.sendMessage(chatId, '⚠️ Por favor describe la falla con texto.');
      estado.falla = texto;
      estado.paso = 'esperando_asesora';
      return bot.sendMessage(chatId, '📞 ¿Cuál es el número de la asesora? (o escribe "omitir")');
    }

    if (estado.paso === 'esperando_asesora') {
      if (foto) return bot.sendMessage(chatId, '⚠️ Por favor escribe el número o "omitir".');
      estado.asesora = texto.toLowerCase() === 'omitir' ? '' : texto;
      estado.paso = 'esperando_imagen';
      return bot.sendMessage(chatId, "📎 Puedes enviar una imagen como evidencia (opcional) o escribe 'omitir'");
    }

    if (estado.paso === 'esperando_imagen') {
      if (foto) estado.imagen = foto;
      else if (texto.toLowerCase() === 'omitir') estado.imagen = null;
      else return bot.sendMessage(chatId, "⚠️ Por favor envía una imagen o escribe 'omitir'.");
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
        else if (texto.toLowerCase() === 'omitir') estado.imagen = null;
        else return bot.sendMessage(chatId, "⚠️ Envía una imagen o escribe 'omitir'.");
      }
      estado.paso = 'confirmando';
      return enviarConfirmacion(chatId, estado);
    }

    // ── Confirmación visual ──────────────────────────────────────

    function enviarConfirmacion(idChat, dataEstado) {
      const asesoraLine = dataEstado.asesora ? `\nAsesora: ${dataEstado.asesora}` : '';
      const tieneImg = dataEstado.imagen ? '\n\n🖼️ [Evidencia adjunta]' : '';
      bot.sendMessage(idChat,
        `📋 Confirma tu reporte:\n\nPunto: ${dataEstado.punto}\nFalla: ${dataEstado.falla}${asesoraLine}${tieneImg}\n\n¿Es correcto?`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Sí, guardar', callback_data: 'confirmar_si' }],
              [{ text: '✏️ Editar Punto', callback_data: 'editar_punto' }, { text: '✏️ Editar Falla', callback_data: 'editar_falla' }],
              [{ text: '✏️ Editar N° Asesora', callback_data: 'editar_asesora' }, { text: '✏️ Editar Evidencia', callback_data: 'editar_imagen' }],
              [{ text: '❌ Cancelar reporte', callback_data: 'confirmar_no' }],
            ]
          }
        }
      );
    }

    // ── Consulta de ticket ───────────────────────────────────────

    if (estado.paso === 'esperando_ticket') {
      if (!/^\d+$/.test(texto)) return bot.sendMessage(chatId, '❌ Ingresa un número válido');
      try {
        const res = await fetch(`${API_URL}/reportes/${texto}`);
        const r = await res.json();
        if (r && r.id) {
          if (String(r.user_id) !== String(chatId)) {
            bot.sendMessage(chatId, `🚫 Acceso denegado: El ticket no te pertenece.`);
          } else {
            const fechaFormat = new Date(r.fecha).toLocaleString('es-CO');
            const asesoraLine = r.asesora ? `\nAsesora: ${r.asesora}` : '';
            bot.sendMessage(chatId, `📄 Estado del ticket #${r.id}:\nPunto: ${r.punto}\nFalla: ${r.falla}${asesoraLine}\nEstado: ${r.estado}\nTécnico: ${r.tecnico || 'No asignado'}\nFecha: ${fechaFormat}`);
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
        delete users[chatId];
      }
    }
  });

  bot.on('polling_error', console.error);
}

module.exports = { registrarHandlers };
