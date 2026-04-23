'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FailedSyncs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      entity_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'user | job',
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      last_attempted_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // One record per (type, entity) — upsert pattern
    await queryInterface.addIndex('FailedSyncs', ['entity_type', 'entity_id'], {
      unique: true,
      name: 'failed_syncs_type_entity_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('FailedSyncs');
  },
};
