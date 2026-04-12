'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id:              { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      conversation_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Conversations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id:       {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      message:         { type: Sequelize.TEXT },
      is_read:         { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at:      { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Messages');
  },
};
