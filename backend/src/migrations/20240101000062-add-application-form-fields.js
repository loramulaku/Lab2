'use strict';

/**
 * Capture the submitted application form so it actually persists and feeds the
 * recruiter pipeline (CV is required). Screening answers + a skills snapshot are
 * stored as JSON so the shape can evolve without further migrations.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Applications', 'cover_letter',        { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('Applications', 'expected_salary',     { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    await queryInterface.addColumn('Applications', 'available_from',      { type: Sequelize.DATEONLY, allowNull: true });
    await queryInterface.addColumn('Applications', 'cv_path',             { type: Sequelize.STRING(500), allowNull: true });
    await queryInterface.addColumn('Applications', 'phone',               { type: Sequelize.STRING(50), allowNull: true });
    await queryInterface.addColumn('Applications', 'willing_to_relocate', { type: Sequelize.BOOLEAN, allowNull: true });
    await queryInterface.addColumn('Applications', 'years_experience',    { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('Applications', 'screening_answers',   { type: Sequelize.JSON, allowNull: true });
    await queryInterface.addColumn('Applications', 'skills_snapshot',     { type: Sequelize.JSON, allowNull: true });
  },

  async down(queryInterface) {
    for (const col of ['cover_letter', 'expected_salary', 'available_from', 'cv_path', 'phone', 'willing_to_relocate', 'years_experience', 'screening_answers', 'skills_snapshot']) {
      await queryInterface.removeColumn('Applications', col);
    }
  },
};
