
const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { permitirRoles } = require('../middlewares/roleMiddleware');

router.use(verificarToken);
router.get('/', reportesController.getReportes);
router.get('/stats', reportesController.getStats);
router.get('/:id/imagen', reportesController.getImagen);
router.put('/:id', permitirRoles('admin','tecnico'), reportesController.putReporte);

module.exports = router;
