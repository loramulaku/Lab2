const { Sequelize } = require('sequelize');
require('dotenv').config();

const sslOptions = process.env.MYSQL_HOST && process.env.MYSQL_HOST.includes('azure.com')
  ? { ssl: { rejectUnauthorized: false } }
  : {};

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: sslOptions,
  }
);

const connectMySQL = async () => {
  await sequelize.authenticate();
  console.log('MySQL connected');
  // Schema is managed by Sequelize CLI migrations — never auto-sync
};

module.exports = { sequelize, connectMySQL };
