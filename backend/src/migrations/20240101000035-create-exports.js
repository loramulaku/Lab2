'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Exports', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:    {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      report_id:  {
        type: Sequelize.INTEGER,
        references: { model: 'Reports', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type:       { type: Sequelize.STRING(50) },
      file_path:  { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Exports');
  },
};
