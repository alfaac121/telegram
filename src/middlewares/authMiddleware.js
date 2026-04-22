
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

exports.verificarToken = (req, res, next) => {
  let token = null;
  if (req.headers.authorization) token = req.headers.authorization.split(' ')[1];
  else if (req.query.token) token = req.query.token;

  if (!token) return res.status(403).json({ error: 'Acceso denegado: No token provisto.' });
  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.user = decodificado;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};
