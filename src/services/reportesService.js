
const db = require('../config/db');

exports.obtenerTodos = async (rol, username) => {
  let query = `
    SELECT r.*, c.nombre 
    FROM reportes r
    LEFT JOIN clientes_telegram c ON r.user_id = c.telegram_id
  `;
  
  if (rol === 'tecnico') {
    const [rows] = await db.query(`${query} WHERE r.tecnico = ? ORDER BY r.fecha DESC`, [username]);
    return rows;
  }
  
  const [rows] = await db.query(`${query} ORDER BY r.fecha DESC`);
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

exports.obtenerStats = async (tecnico = null) => {
  let whereClause = "";
  let params = [];

  if (tecnico && tecnico !== "todos") {
    whereClause = " WHERE tecnico = ?";
    params = [tecnico];
  }

  const [total] = await db.query(`SELECT COUNT(*) as total FROM reportes${whereClause}`, params);
  const [pendientes] = await db.query(`SELECT COUNT(*) as total FROM reportes WHERE estado = 'pendiente'${tecnico && tecnico !== 'todos' ? ' AND tecnico = ?' : ''}`, params);
  const [resueltos] = await db.query(`SELECT COUNT(*) as total FROM reportes WHERE estado = 'resuelto'${tecnico && tecnico !== 'todos' ? ' AND tecnico = ?' : ''}`, params);
  const [enProceso] = await db.query(`SELECT COUNT(*) as total FROM reportes WHERE estado = 'en_proceso'${tecnico && tecnico !== 'todos' ? ' AND tecnico = ?' : ''}`, params);
  
  // Si filtramos por técnico, contamos los usuarios únicos que ese técnico ha atendido
  const usuariosQuery = tecnico && tecnico !== 'todos' 
    ? `SELECT COUNT(DISTINCT user_id) as total FROM reportes WHERE tecnico = ?`
    : `SELECT COUNT(DISTINCT telegram_id) as total FROM clientes_telegram`;
  
  const [usuarios] = await db.query(usuariosQuery, params);
  
  // Obtener lista de técnicos únicos para el filtro
  const [listaTecnicos] = await db.query('SELECT DISTINCT tecnico FROM reportes WHERE tecnico IS NOT NULL AND tecnico != ""');

  return {
      totalReportes: total[0].total,
      pendientes: pendientes[0].total,
      resueltos: resueltos[0].total,
      enProceso: enProceso[0].total,
      totalUsuarios: usuarios[0].total,
      tecnicos: listaTecnicos.map(t => t.tecnico)
  };
};

exports.buscarRutaImagen = async (id) => {
  const [rows] = await db.query('SELECT imagen FROM reportes WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return rows[0].imagen;
};
