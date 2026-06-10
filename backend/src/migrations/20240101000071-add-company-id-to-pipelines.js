'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Pipelines', 'company_id', {
      type:         Sequelize.INTEGER,
      allowNull:    true,
      defaultValue: null,
      after:        'id',
      references:   { model: 'Companies', key: 'id' },
      onUpdate:     'CASCADE',
      onDelete:     'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Pipelines', 'company_id');
  },
};
