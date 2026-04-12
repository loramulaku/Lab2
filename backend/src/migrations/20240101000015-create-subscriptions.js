'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Subscriptions', {
      id:                     { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      company_id:             {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      plan_id:                {
        type: Sequelize.INTEGER,
        references: { model: 'Plans', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      stripe_subscription_id: { type: Sequelize.STRING(255) },
      status:                 { type: Sequelize.STRING(50) },
      current_period_end:     { type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Subscriptions');
  },
};
