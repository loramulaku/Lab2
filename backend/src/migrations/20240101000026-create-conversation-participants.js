'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConversationParticipants', {
      id:              { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      conversation_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Conversations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id:         {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('ConversationParticipants', ['conversation_id', 'user_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ConversationParticipants');
  },
};
