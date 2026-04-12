'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invitations', {
      id:                 { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      company_id:         {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      freelancer_id:      {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      job_id:             {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      message:            { type: Sequelize.TEXT },
      price_offer:        { type: Sequelize.DECIMAL(10, 2) },
      delivery_time_days: { type: Sequelize.INTEGER },
      status:             { type: Sequelize.STRING(50) },
      created_at:         { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Invitations');
  },
};
