'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Educations', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:     {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      degree:      { type: Sequelize.STRING(255), allowNull: false },
      institution: { type: Sequelize.STRING(255), allowNull: false },
      start_year:  { type: Sequelize.SMALLINT, allowNull: false },
      end_year:    { type: Sequelize.SMALLINT, allowNull: true },
      created_at:  { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Educations');
  },
};
