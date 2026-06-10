'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('PipelineStages');
    if (!tableDesc.has_calendar) {
      await queryInterface.addColumn('PipelineStages', 'has_calendar', {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: false,
        after:        'order_index',
      });
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('PipelineStages');
    if (tableDesc.has_calendar) {
      await queryInterface.removeColumn('PipelineStages', 'has_calendar');
    }
  },
};
