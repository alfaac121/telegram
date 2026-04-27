const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function fix() {
  const hash = await bcrypt.hash('123456', 10);
  await db.query('DELETE FROM usuarios WHERE email = "admin@admin.com"');
  const [res] = await db.query('INSERT INTO usuarios (username, email, password, rol) VALUES (?, ?, ?, ?)', ['admin', 'admin@admin.com', hash, 'admin']);
  await db.query('INSERT IGNORE INTO permisos (id_usuario, id_modulo) SELECT ?, id FROM modulos', [res.insertId]);
  console.log('✅ Usuario Admin configurado con éxito');
  process.exit(0);
}
fix();
