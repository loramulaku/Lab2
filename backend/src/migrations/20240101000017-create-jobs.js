'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jobs', {
      id:              { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      company_id:      {
        type: Sequelize.INTEGER,
        references: { model: 'Companies', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title:           { type: Sequelize.STRING(255) },
      description:     { type: Sequelize.TEXT },
      employment_type: { type: Sequelize.STRING(50) },
      work_mode:       { type: Sequelize.STRING(50) },
      job_mode:        { type: Sequelize.STRING(50) },
      budget_min:      { type: Sequelize.DECIMAL(10, 2) },
      budget_max:      { type: Sequelize.DECIMAL(10, 2) },
      expires_at:      { type: Sequelize.DATE },
      deadline:        { type: Sequelize.DATE },
      status:          { type: Sequelize.STRING(50) },
      created_at:      { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.dropTable('Jobs');
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
