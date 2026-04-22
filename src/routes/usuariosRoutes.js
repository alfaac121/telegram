
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

router.use(verificarToken);
router.get('/clientes', usuariosController.getClientes); // Telegram users
router.get('/empleados', permitirRoles('admin'), usuariosController.getEmpleados); // Admin dashboard users

module.exports = router;
