'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('PipelineStages', 'has_calendar', {
      type:         Sequelize.BOOLEAN,
      allowNull:    false,
      defaultValue: false,
      after:        'order_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('PipelineStages', 'has_calendar');
  },
};
