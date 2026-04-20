'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Jobs', 'experience_level', {
      type: Sequelize.ENUM('junior', 'mid', 'senior'),
      allowNull: true,
    });
    await queryInterface.addColumn('Jobs', 'recruiter_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Jobs', 'experience_level');
    await queryInterface.removeColumn('Jobs', 'recruiter_id');
  },
};
