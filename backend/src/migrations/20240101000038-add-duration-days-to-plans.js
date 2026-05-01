'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Plans', 'duration_days', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 30,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Plans', 'duration_days');
  },
};
