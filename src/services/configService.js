const db = require('../config/db');

exports.obtenerConfig = async (clave) => {
  const [rows] = await db.query('SELECT valor FROM configuracion WHERE clave = ?', [clave]);
  return rows.length > 0 ? rows[0].valor : null;
};

exports.guardarConfig = async (clave, valor) => {
  await db.query(
    'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
    [clave, valor]
  );
};
