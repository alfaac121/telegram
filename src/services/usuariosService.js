
const db = require('../config/db');

exports.obtenerClientes = async () => {
  const [rows] = await db.query('SELECT * FROM clientes_telegram ORDER BY id DESC');
  return rows;
};

exports.obtenerEmpleados = async () => {
  const [rows] = await db.query('SELECT id, username, email, rol FROM usuarios ORDER BY id DESC');
  return rows;
};
