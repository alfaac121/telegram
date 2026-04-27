
const db = require('../config/db');

exports.obtenerTodos = async (rol, username) => {
  if (rol === 'tecnico') {
    const [rows] = await db.query('SELECT * FROM reportes WHERE tecnico = ? ORDER BY fecha DESC', [username]);
    return rows;
  }
  const [rows] = await db.query('SELECT * FROM reportes ORDER BY fecha DESC');
  return rows;
};

exports.actualizarReporte = async (id, estado, tecnico, userRol) => {
  if (userRol === 'supervisor') throw new Error('Forbidden');
  
  const [rows] = await db.query('SELECT * FROM reportes WHERE id = ?', [id]);
  if (rows.length === 0) throw new Error('Not Found');
  
  const ticket = rows[0];
  const newEstado = estado || ticket.estado;
  const newTecnico = tecnico !== undefined ? tecnico : ticket.tecnico;

  await db.query('UPDATE reportes SET estado = ?, tecnico = ? WHERE id = ?', [newEstado, newTecnico, id]);
  return { ticket, newTecnico };
};

exports.obtenerStats = async () => {
  const [total] = await db.query('SELECT COUNT(*) as total FROM reportes');
  const [pendientes] = await db.query("SELECT COUNT(*) as total FROM reportes WHERE estado = 'pendiente'");
  const [resueltos] = await db.query("SELECT COUNT(*) as total FROM reportes WHERE estado = 'resuelto'");
  const [enProceso] = await db.query("SELECT COUNT(*) as total FROM reportes WHERE estado = 'en_proceso'");
  const [usuarios] = await db.query('SELECT COUNT(DISTINCT telegram_id) as total FROM clientes_telegram');
  return {
      totalReportes: total[0].total,
      pendientes: pendientes[0].total,
      resueltos: resueltos[0].total,
      enProceso: enProceso[0].total,
      totalUsuarios: usuarios[0].total,
  };
};

exports.buscarRutaImagen = async (id) => {
  const [rows] = await db.query('SELECT imagen FROM reportes WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return rows[0].imagen;
};
