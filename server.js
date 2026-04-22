require('./src/config/db'); // initialize DB connection
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const { registrarHandlers } = require('./src/bot/telegramBot');
const { PORT } = require('./src/config/env');

const authRoutes = require('./src/routes/authRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const botRoutes = require('./src/routes/botRoutes'); // for bot HTTP decoupled logic

const app = express();

// ── Configuraciones ──────────────────────────────────────────────
app.use(cors()); // Importante para cuando frontend en Vite llame a la API
app.use(express.json());

// ── Rutas ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/bot', botRoutes); // open/internal paths for the bot to hit DB

// ── Telegram Bot ────────────────────────────────────────────────
const TOKEN = '8628255931:AAEx1OuJlawM3LJImleD9Yg9H8b6xQC2F9Y';
const bot = new TelegramBot(TOKEN, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Abrir menú principal' },
  { command: '/reportar', description: 'Reportar una falla rápidamente' },
  { command: '/estado', description: 'Consultar el estado de tu ticket' }
]);

registrarHandlers(bot);
app.set('bot', bot);

console.log('🤖 Bot iniciado correctamente. Esperando mensajes...');

// ── Iniciar servidor HTTP ────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🌐 Backend empresarial escuchando en el puerto: ${PORT}`);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo bot y servidor...');
    bot.stopPolling();
    process.exit(0);
});
