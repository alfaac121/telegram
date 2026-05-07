const db = require('../config/db');

exports.saveUser = async (req, res) => {
  try {
    const { telegram_id, nombre, punto, descripcion } = req.body;
    await db.query(
      'INSERT INTO clientes_telegram (telegram_id, nombre, punto, descripcion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), punto = VALUES(punto), descripcion = VALUES(descripcion)',
      [telegram_id, nombre, punto || null, descripcion]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.saveReporte = async (req, res) => {
  try {
    const { user_id, area, punto, falla, asesora, imagen } = req.body;
    const [result] = await db.query(
      'INSERT INTO reportes (user_id, area, punto, falla, asesora, imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, area || 'Soporte TI', punto, falla, asesora || null, imagen || null]
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, user_id, area, punto, falla, asesora, estado, tecnico, fecha FROM reportes WHERE id = ?',
      [id]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getUltimosTickets = async (req, res) => {
  try {
    const { telegram_id } = req.params;
    const [rows] = await db.query(
      'SELECT id FROM reportes WHERE user_id = ? ORDER BY id DESC LIMIT 3',
      [telegram_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};