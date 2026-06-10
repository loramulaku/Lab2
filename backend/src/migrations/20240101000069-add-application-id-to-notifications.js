'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Notifications', 'application_id', {
      type:         Sequelize.INTEGER,
      allowNull:    true,
      defaultValue: null,
      after:        'user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Notifications', 'application_id');
  },
};
