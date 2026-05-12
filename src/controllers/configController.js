const configService = require('../services/configService');

exports.getConfig = async (req, res) => {
  try {
    const { clave } = req.params;
    const valor = await configService.obtenerConfig(clave);
    res.json({ clave, valor: valor || '' });
  } catch (e) {
    res.status(500).json({ error: 'Error obteniendo config' });
  }
};

exports.putConfig = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Solo el admin puede modificar la configuración' });
    const { clave } = req.params;
    const { valor } = req.body;
    if (valor === undefined) return res.status(400).json({ error: 'Falta el campo valor' });
    await configService.guardarConfig(clave, valor);
    res.json({ mensaje: 'Configuración guardada', clave, valor });
  } catch (e) {
    res.status(500).json({ error: 'Error guardando config' });
  }
};
