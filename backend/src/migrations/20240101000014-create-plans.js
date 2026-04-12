'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Plans', {
      id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:      { type: Sequelize.STRING(50), unique: true },
      price:     { type: Sequelize.DECIMAL(10, 2) },
      job_limit: { type: Sequelize.INTEGER },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.dropTable('Plans');
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
