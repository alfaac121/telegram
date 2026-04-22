
const usuariosService = require('../services/usuariosService');
exports.getClientes = async (req, res) => {
  try {
    res.json(await usuariosService.obtenerClientes());
  } catch(e){ res.status(500).json({error: 'err'}); }
};
exports.getEmpleados = async (req, res) => {
  try {
    res.json(await usuariosService.obtenerEmpleados());
  } catch(e){ res.status(500).json({error: 'err'}); }
};
