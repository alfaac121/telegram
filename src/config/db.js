
const mysql = require('mysql2');
const conexion = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'telegram_bot'
});
conexion.connect(err => {
  if(err) console.error('Error BD:', err);
  else console.log('✅ Conectado a MySQL');
});
module.exports = conexion;
module.exports.promise = conexion.promise();
