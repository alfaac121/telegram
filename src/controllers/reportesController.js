
const reportesService = require('../services/reportesService');

exports.getReportes = async (req, res) => {
  try {
    const reportes = await reportesService.obtenerTodos(req.user.rol, req.user.username);
    res.json(reportes);
  } catch(e) {
    res.status(500).json({error: 'Error'});
  }
};

exports.putReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, tecnico } = req.body;
    const bot = req.app.get('bot');

    const args = await reportesService.actualizarReporte(id, estado, tecnico, req.user.rol);
    
    // Si asiganamos un nuevo tecnico, notificamos
    if (tecnico && tecnico !== args.ticket.tecnico && bot) {
      try {
        bot.sendMessage(args.ticket.user_id, `👨‍🔧 Tu ticket #${id} ha sido asignado al técnico: ${tecnico}`);
      } catch (e) {
         console.error('Error enviando tg msg');
      }
    }
    res.json({mensaje: 'Actualizado'});

  } catch(e) {
     if(e.message === 'Forbidden') return res.status(403).json({ error: 'Supervisores no pueden modificar' });
     if(e.message === 'Not Found') return res.status(404).json({ error: 'No encontrado' });
     res.status(500).json({error: 'Error server'});
  }
};

exports.getStats = async (req, res) => {
   try {
     const { tecnico } = req.query;
     const stats = await reportesService.obtenerStats(tecnico);
     res.json(stats);
   } catch(e){
     res.status(500).json({error: 'Error'});
   }
};

exports.getImagen = async (req, res) => {
   try {
      const fileId = await reportesService.buscarRutaImagen(req.params.id);
      if(!fileId) return res.status(404).send('Sin imagen');

      const bot = req.app.get('bot');
      if(!bot) return res.status(500).send('Bot sin conexion');

      const fileLink = await bot.getFileLink(fileId);
      const https = require('https');
      https.get(fileLink, (telegramRes) => {
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Disposition': 'inline; filename="evidencia.jpg"',
            'Cache-Control': 'no-store, no-cache' 
        });
        telegramRes.pipe(res);
      });
   } catch(e){
      res.status(500).send('Error img');
   }
};
