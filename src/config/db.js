
const mysql = require('mysql2');
const conexion = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'telegram_bot'
});
conexion.connect(err => {
  if(err) console.error('Error BD:', err);
  else console.log('✅ Conectado a MySQL');
});
module.exports = conexion;
module.exports.promise = conexion.promise();
