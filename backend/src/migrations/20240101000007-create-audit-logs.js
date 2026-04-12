'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:    {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action:     { type: Sequelize.STRING(255) },
      entity:     { type: Sequelize.STRING(100) },
      old_value:  { type: Sequelize.TEXT },
      new_value:  { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('AuditLogs');
  },
};
