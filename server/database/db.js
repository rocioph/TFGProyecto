const mysql = require('mysql2');
const config = require('../config');

const connection = mysql.createConnection({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database
});

connection.connect((error) => {
  if (error) {
    console.error('❌ Error al conectar con la BD:', error);
    return;
  }
  console.log('✅ Conexión a MySQL exitosa');
});

module.exports = connection;
