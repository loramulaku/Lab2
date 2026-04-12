'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PipelineStages', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      pipeline_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Pipelines', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name:        { type: Sequelize.STRING(100) },
      order_index: { type: Sequelize.INTEGER },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.dropTable('PipelineStages');
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
