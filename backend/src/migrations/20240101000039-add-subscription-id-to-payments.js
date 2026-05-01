'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payments', 'subscription_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Subscriptions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Payments', 'subscription_id');
  },
};
