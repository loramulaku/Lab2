'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Files', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:    {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      file_url:   { type: Sequelize.TEXT },
      file_type:  { type: Sequelize.STRING(50) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Files');
  },
};
