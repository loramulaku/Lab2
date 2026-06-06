'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Notifications', 'link', {
      type:         Sequelize.STRING(500),
      allowNull:    true,
      defaultValue: null,
      after:        'message',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Notifications', 'link');
  },
};
