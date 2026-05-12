const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verificarToken } = require('../middlewares/authMiddleware');

// GET público — el bot lo necesita sin token
router.get('/:clave', configController.getConfig);
// PUT protegido — solo admin
router.put('/:clave', verificarToken, configController.putConfig);

module.exports = router;
