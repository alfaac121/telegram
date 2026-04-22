
exports.permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
       return res.status(403).json({ error: 'Acceso denegado por falta de permisos de rol.' });
    }
    next();
  };
};
