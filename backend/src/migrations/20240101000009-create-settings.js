'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id:      { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      key:     { type: Sequelize.STRING(100) },
      value:   { type: Sequelize.TEXT },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Settings');
  },
};
