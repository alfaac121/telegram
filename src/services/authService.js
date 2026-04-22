
const db = require('../config/db').promise;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

exports.loginUsuario = async (username, password) => {
  // Support either username or email as login
  const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? OR username = ?', [username, username]);
  if (rows.length === 0) throw new Error('Usuario no encontrado');
  
  const usuario = rows[0];
  const passValida = await bcrypt.compare(password, usuario.password);
  if (!passValida) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, username: usuario.username, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
  return { token, usuario: { id: usuario.id, username: usuario.username, email: usuario.email, rol: usuario.rol } };
};

exports.obtenerPermisosUsuario = async (userId) => {
  const [rows] = await db.query(
    'SELECT m.id, m.nombre FROM modulos m JOIN permisos p ON m.id = p.id_modulo WHERE p.id_usuario = ?', 
  [userId]);
  return rows;
};
