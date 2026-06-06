'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Plans', 'billing_interval', {
      type: Sequelize.ENUM('month', 'year'),
      allowNull: false,
      defaultValue: 'month',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Plans', 'billing_interval');
  },
};
