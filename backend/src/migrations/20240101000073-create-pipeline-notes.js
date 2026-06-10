'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('PipelineNotes')) {
      await queryInterface.createTable('PipelineNotes', {
        id: {
          type:          Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey:    true,
        },
        application_id: {
          type:       Sequelize.INTEGER,
          allowNull:  false,
          references: { model: 'Applications', key: 'id' },
          onUpdate:   'CASCADE',
          onDelete:   'CASCADE',
        },
        stage_id: {
          type:       Sequelize.INTEGER,
          allowNull:  false,
          references: { model: 'PipelineStages', key: 'id' },
          onUpdate:   'CASCADE',
          onDelete:   'CASCADE',
        },
        note: {
          type:      Sequelize.TEXT,
          allowNull: false,
        },
        interview_at: {
          type:         Sequelize.DATE,
          allowNull:    true,
          defaultValue: null,
        },
        created_by: {
          type:      Sequelize.INTEGER,
          allowNull: false,
        },
        created_at: {
          type:         Sequelize.DATE,
          allowNull:    false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('PipelineNotes');
  },
};
