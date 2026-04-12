'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StageHistory', {
      id:             { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      application_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      from_stage_id:  { type: Sequelize.INTEGER },  // soft ref, no FK in original schema
      to_stage_id:    { type: Sequelize.INTEGER },  // soft ref
      changed_by:     {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at:     { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('StageHistory');
  },
};
