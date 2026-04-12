'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobSkills', {
      id:       { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      job_id:   {
        type: Sequelize.INTEGER,
        references: { model: 'Jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      skill_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Skills', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('JobSkills', ['job_id', 'skill_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('JobSkills');
  },
};
