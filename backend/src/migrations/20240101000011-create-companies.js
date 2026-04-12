'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:        { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT },
      website:     { type: Sequelize.STRING(255) },
      created_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.dropTable('Companies');
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
