'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Payments', 'currency', {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: 'usd',
      after: 'amount',
    });
    await queryInterface.addColumn('Payments', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Plans', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'currency',
    });
    await queryInterface.addColumn('Payments', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'plan_id',
    });
    await queryInterface.addColumn('Payments', 'payment_method', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Payments', 'payment_method');
    await queryInterface.removeColumn('Payments', 'user_id');
    await queryInterface.removeColumn('Payments', 'plan_id');
    await queryInterface.removeColumn('Payments', 'currency');
  },
};
