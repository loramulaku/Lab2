'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id:                       { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      company_id:               {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      stripe_payment_intent_id: { type: Sequelize.STRING(255) },
      amount:                   { type: Sequelize.DECIMAL(10, 2) },
      status:                   { type: Sequelize.STRING(50) },
      created_at:               { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Payments');
  },
};
