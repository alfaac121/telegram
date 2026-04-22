
const authService = require('../services/authService');

exports.login = async (req, res) => {
  const { username, password } = req.body; // Can be email or username
  try {
    const r = await authService.loginUsuario(username, password);
    res.json(r);
  } catch (error) {
    if(error.message === 'Usuario no encontrado') return res.status(404).json({error: error.message});
    if(error.message === 'Contraseña incorrecta') return res.status(401).json({error: error.message});
    res.status(500).json({error: 'Error del servidor'});
  }
};

exports.me = async (req, res) => {
  try {
    const modulos = await authService.obtenerPermisosUsuario(req.user.id);
    res.json({ user: req.user, permisos: modulos });
  } catch (error) {
    res.status(500).json({error: 'Error consultando perfil'});
  }
};
