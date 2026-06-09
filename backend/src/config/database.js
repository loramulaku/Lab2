require('dotenv').config();

const azureSSL = process.env.MYSQL_HOST && process.env.MYSQL_HOST.includes('azure.com')
  ? { dialectOptions: { ssl: { rejectUnauthorized: false } } }
  : {};

module.exports = {
  development: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT, 10) || 3306,
    dialect:  'mysql',
    logging:  console.log,
    ...azureSSL,
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    host:     process.env.MYSQL_HOST,
    port:     parseInt(process.env.MYSQL_PORT, 10) || 3306,
    dialect:  'mysql',
    logging:  false,
    ...azureSSL,
  },
};
