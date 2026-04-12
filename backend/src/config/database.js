require('dotenv').config();

module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT, 10) || 3306,
    dialect:  'mysql',
    logging:  console.log,
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT, 10) || 3306,
    dialect:  'mysql',
    logging:  false,
  },
};
