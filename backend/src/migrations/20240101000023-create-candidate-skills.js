'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CandidateSkills', {
      id:       { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:  {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      skill_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Skills', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      level:    { type: Sequelize.STRING(50) },
    });

    await queryInterface.addIndex('CandidateSkills', ['user_id', 'skill_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CandidateSkills');
  },
};
