/**
 * Shared database bootstrap for integration tests.
 * Connects to the same MySQL + MongoDB instances used in development.
 * Tests are responsible for cleaning up their own data (see fixtures.js).
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { connectMySQL, sequelize } = require('../../src/config/mysql');
const { connectMongoDB }          = require('../../src/config/mongodb');
const mongoose                    = require('mongoose');

module.exports = {
  connect: async () => {
    await connectMySQL();
    await connectMongoDB();
  },

  disconnect: async () => {
    await sequelize.close();
    await mongoose.disconnect();
  },
};
