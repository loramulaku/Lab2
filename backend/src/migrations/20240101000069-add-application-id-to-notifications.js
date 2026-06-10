'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Notifications');
    if (!tableDesc.application_id) {
      await queryInterface.addColumn('Notifications', 'application_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        after: 'user_id',
      });
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('Notifications');
    if (tableDesc.application_id) {
      await queryInterface.removeColumn('Notifications', 'application_id');
    }
  },
};
