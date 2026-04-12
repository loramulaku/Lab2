'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Contracts', {
      id:            { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      job_id:        {
        type: Sequelize.INTEGER,
        references: { model: 'Jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      freelancer_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      company_id:    {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bid_id:        {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Bids', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      agreed_price:  { type: Sequelize.DECIMAL(10, 2) },
      start_date:    { type: Sequelize.DATEONLY },
      end_date:      { type: Sequelize.DATEONLY },
      status:        { type: Sequelize.STRING(50) },
      price:         { type: Sequelize.DECIMAL(10, 2) },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Contracts');
  },
};
