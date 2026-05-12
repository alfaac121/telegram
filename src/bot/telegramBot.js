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
      bot.sendMessage(chatId, `💻 *Centro de Soporte TI*\n\nHas seleccionado Soporte Técnico. Por favor, elige la categoría que mejor describa tu inconveniente para brindarte una solución más rápida:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔐 Problemas de Acceso', callback_data: 'ti_cat_acceso' }],
            [{ text: '💻 Fallas en Equipos', callback_data: 'ti_cat_equipos' }],
            [{ text: '🚀 Software y Aplicaciones', callback_data: 'ti_cat_software' }],
            [{ text: '🌐 Red e Internet', callback_data: 'ti_cat_red' }],
            [{ text: '📋 Solicitudes y Servicios', callback_data: 'ti_cat_servicios' }],
            [{ text: '🔍 Consultar un Ticket', callback_data: 'accion_estado' }],
            [{ text: '⬅️ Volver al Menú Principal', callback_data: 'volver_principal' }]
          ]
        }
      });
      return;
    } else {
      opciones = [
        [{ text: '📝 Registrar solicitud', callback_data: 'accion_reportar' }],
        [{ text: '🔍 Consultar estado', callback_data: 'accion_estado' }],
        [{ text: '⬅️ Volver', callback_data: 'volver_principal' }]
      ];
      bot.sendMessage(chatId, `📍 Has seleccionado: *${areaNombre}*\n¿Qué deseas hacer?`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: opciones }
      });
    }
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

    // --- FLUJOS ESPECÍFICOS DE TI ---

    if (data === 'ti_cat_acceso') {
      users[chatId].categoria = 'Problemas de Acceso';
      bot.sendMessage(chatId, `🔐 *Problemas de Acceso*\n\n¿En qué sistema o plataforma presentas el inconveniente?`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📧 Correo Corporativo', callback_data: 'ti_sub_acceso_correo' }],
            [{ text: '📂 Sistema Interno (SIIS)', callback_data: 'ti_sub_acceso_siis' }],
            [{ text: '🔑 VPN / Escritorio Remoto', callback_data: 'ti_sub_acceso_vpn' }],
            [{ text: '❓ Otro / No listado', callback_data: 'ti_sub_acceso_otro' }],
            [{ text: '⬅️ Volver', callback_data: 'area_soporte_ti' }]
          ]
        }
      });
      return;
    }

    if (data === 'ti_cat_equipos') {
      users[chatId].categoria = 'Fallas en Equipos';
      bot.sendMessage(chatId, `💻 *Fallas en Equipos*\n\nSelecciona el tipo de hardware afectado:`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🖥️ Laptop / Computador', callback_data: 'ti_sub_equipo_pc' }],
            [{ text: '🖨️ Impresora / Escáner', callback_data: 'ti_sub_equipo_print' }],
            [{ text: '☎️ Teléfono IP / Diadema', callback_data: 'ti_sub_equipo_tel' }],
            [{ text: '⬅️ Volver', callback_data: 'area_soporte_ti' }]
          ]
        }
      });
      return;
    }

    if (data === 'ti_cat_software') {
      users[chatId].categoria = 'Software y Aplicaciones';
      bot.sendMessage(chatId, `🚀 *Software y Aplicaciones*\n\n¿Con qué software necesitas asistencia?`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📦 Office 365 / Teams', callback_data: 'ti_sub_soft_office' }],
            [{ text: '🛡️ Antivirus / Seguridad', callback_data: 'ti_sub_soft_security' }],
            [{ text: '📊 Aplicativos de Negocio', callback_data: 'ti_sub_soft_business' }],
            [{ text: '⬅️ Volver', callback_data: 'area_soporte_ti' }]
          ]
        }
      });
      return;
    }

    if (data === 'ti_cat_red') {
      users[chatId].categoria = 'Red e Internet';
      bot.sendMessage(chatId, `🌐 *Red e Internet*\n\n¿Qué tipo de problema de conexión presentas?`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Sin acceso a Internet', callback_data: 'ti_sub_red_no_net' }],
            [{ text: '🐢 Lentitud en la navegación', callback_data: 'ti_sub_red_slow' }],
            [{ text: '📡 Falla en señal Wi-Fi', callback_data: 'ti_sub_red_wifi' }],
            [{ text: '⬅️ Volver', callback_data: 'area_soporte_ti' }]
          ]
        }
      });
      return;
    }

    if (data === 'ti_cat_servicios') {
      users[chatId].categoria = 'Solicitudes y Servicios';
      bot.sendMessage(chatId, `📋 *Solicitudes y Servicios*\n\n¿Qué trámite o servicio requieres?`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🆕 Solicitud de Hardware', callback_data: 'ti_sub_serv_hard' }],
            [{ text: '📂 Permisos de Carpetas', callback_data: 'ti_sub_serv_perm' }],
            [{ text: '📥 Instalación de Software', callback_data: 'ti_sub_serv_inst' }],
            [{ text: '⬅️ Volver', callback_data: 'area_soporte_ti' }]
          ]
        }
      });
      return;
    }

    // --- HANDLER DE SELECCIÓN FINAL DE SUB-CATEGORÍA ---
    if (data.startsWith('ti_sub_')) {
      const subMapping = {
        acceso_correo: 'Acceso a Correo', acceso_siis: 'Acceso a SIIS', acceso_vpn: 'Acceso a VPN', acceso_otro: 'Acceso Otros',
        equipo_pc: 'Falla en PC', equipo_print: 'Falla en Impresora', equipo_tel: 'Falla en Telefonía',
        soft_office: 'Soporte Office', soft_security: 'Soporte Seguridad', soft_business: 'Soporte Aplicativos',
        red_no_net: 'Sin Internet', red_slow: 'Lentitud de Red', red_wifi: 'Falla de Wi-Fi',
        serv_hard: 'Pedido de Hardware', serv_perm: 'Permisos de Acceso', serv_inst: 'Instalación de Software'
      };
      const subKey = data.replace('ti_sub_', '');
      const subNombre = subMapping[subKey] || 'General';
      
      users[chatId].subCategoria = subNombre;
      users[chatId].paso = 'esperando_punto';
      users[chatId].punto = '';
      users[chatId].falla = '';
      users[chatId].asesora = '';
      users[chatId].imagen = null;

      bot.sendMessage(chatId, `✅ Has seleccionado: *${subNombre}*\n\nPara generar tu ticket oficial, por favor indica el *Punto de venta o Sucursal* desde donde reportas:`, { parse_mode: 'Markdown' });
      return;
    }

    // --- ACCIONES GENERALES ---

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
      
      const fullFalla = estado.subCategoria ? `[${estado.subCategoria}] - ${estado.falla}` : estado.falla;
      
      try {
        const res = await fetch(`${API_URL}/reportes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: chatId,
            area: estado.area,
            punto: estado.punto,
            falla: fullFalla,
            asesora: estado.asesora || null,
            imagen: estado.imagen || null
          })
        });
        const result = await res.json();
        if (!res.ok) throw new Error('Error de API');
        bot.sendMessage(chatId, `✅ *Ticket TI Generado*\n\nSe ha registrado tu solicitud en el área de *${estado.area}*.\n\n🎫 *Número de Ticket:* #${result.id}\n📍 *Sucursal:* ${estado.punto}\n🛠️ *Categoría:* ${estado.subCategoria || 'General'}\n\nNuestro equipo técnico atenderá tu requerimiento a la brevedad.`, {
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
      let msj = '';
      if (estado.areaKey === 'soporte_ti') {
        msj = `Entendido. Ahora, describe detalladamente el inconveniente con *${estado.subCategoria || 'el servicio'}*:`;
      } else {
        msj = `Describe detalladamente tu solicitud para *${estado.area}*:`;
      }
      return bot.sendMessage(chatId, msj, { parse_mode: 'Markdown' });
    }

    if (estado.paso === 'esperando_falla') {
      if (foto) return bot.sendMessage(chatId, '⚠️ Por favor describe la situación con texto.');
      estado.falla = texto;
      estado.paso = 'esperando_asesora';
      return bot.sendMessage(chatId, '📞 ¿A qué número podemos contactarte para el seguimiento? (o escribe "omitir")');
    }

    if (estado.paso === 'esperando_asesora') {
      if (foto) return bot.sendMessage(chatId, '⚠️ Por favor escribe el número o "omitir".');
      estado.asesora = texto.toLowerCase() === 'omitir' ? '' : texto;
      estado.paso = 'esperando_imagen';
      return bot.sendMessage(chatId, "📎 Si tienes una imagen o captura del error, envíala ahora (opcional), de lo contrario escribe 'omitir':");
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
      const contactLine = dataEstado.asesora ? `\n📞 *Contacto:* ${dataEstado.asesora}` : '';
      const tieneImg = dataEstado.imagen ? '\n🖼️ [Evidencia adjunta]' : '';
      const categoriaLine = dataEstado.subCategoria ? `\n🛠️ *Categoría:* ${dataEstado.subCategoria}` : '';

      bot.sendMessage(idChat,
        `📋 *Resumen de tu Requerimiento*\n\n*Área:* ${dataEstado.area}${categoriaLine}\n*Punto:* ${dataEstado.punto}\n*Descripción:* ${dataEstado.falla}${contactLine}${tieneImg}\n\n¿Deseas enviar este ticket a la mesa de ayuda?`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Confirmar y Enviar', callback_data: 'confirmar_si' }],
              [{ text: '✏️ Editar Punto', callback_data: 'editar_punto' }, { text: '✏️ Editar Descripción', callback_data: 'editar_falla' }],
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
