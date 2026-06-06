'use strict';

/**
 * Reusable candidate-profile fields used to PREFILL the application/bid forms,
 * so the candidate never re-types what we already have. Populated either from
 * "My Profile" or saved back on first application submit.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CandidateProfiles', 'phone',               { type: Sequelize.STRING(50),  allowNull: true });
    await queryInterface.addColumn('CandidateProfiles', 'linkedin_url',        { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('CandidateProfiles', 'github_url',          { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('CandidateProfiles', 'portfolio_url',       { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('CandidateProfiles', 'cv_path',             { type: Sequelize.STRING(500), allowNull: true });
    await queryInterface.addColumn('CandidateProfiles', 'willing_to_relocate', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('CandidateProfiles', 'years_experience',    { type: Sequelize.INTEGER, allowNull: true });
  },

  async down(queryInterface) {
    for (const col of ['phone', 'linkedin_url', 'github_url', 'portfolio_url', 'cv_path', 'willing_to_relocate', 'years_experience']) {
      await queryInterface.removeColumn('CandidateProfiles', col);
    }
  },
};
