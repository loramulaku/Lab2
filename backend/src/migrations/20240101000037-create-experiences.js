'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Experiences', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:     {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title:       { type: Sequelize.STRING(255), allowNull: false },
      company:     { type: Sequelize.STRING(255), allowNull: false },
      start_date:  { type: Sequelize.DATEONLY, allowNull: false },
      end_date:    { type: Sequelize.DATEONLY, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Experiences');
  },
};
