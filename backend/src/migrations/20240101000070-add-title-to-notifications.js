'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Notifications', 'title', {
      type:         Sequelize.STRING(255),
      allowNull:    true,
      defaultValue: null,
      after:        'type',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Notifications', 'title');
  },
};
