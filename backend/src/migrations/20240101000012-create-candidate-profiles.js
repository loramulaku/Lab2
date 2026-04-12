'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CandidateProfiles', {
      id:       { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id:  {
        type: Sequelize.INTEGER,
        unique: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      headline: { type: Sequelize.STRING(255) },
      bio:      { type: Sequelize.TEXT },
      location: { type: Sequelize.STRING(150) },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CandidateProfiles');
  },
};
