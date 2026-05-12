const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'telegram_bot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔥 exporta directo el pool promise
module.exports = pool.promise();