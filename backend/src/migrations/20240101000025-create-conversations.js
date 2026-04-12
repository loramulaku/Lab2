'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Conversations', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.dropTable('Conversations');
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
