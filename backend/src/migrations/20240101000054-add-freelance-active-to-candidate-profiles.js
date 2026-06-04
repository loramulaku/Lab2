'use strict';

/**
 * FEATURE 1 — Candidate Freelance Activation.
 *
 * Adds a single app-maintained boolean `freelance_active` to CandidateProfiles.
 * When true the candidate is treated as a job seeker AND a freelancer: their
 * profile gains a freelance section (bids) and they become discoverable in the
 * recruiter "Search & Invite" (Mode B) freelancer search.
 *
 * Additive + idempotent — safe to (re)run on a DB that already has the column.
 * Never modify earlier migrations; this is a new one.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const seq = queryInterface.sequelize;
    const hasColumn = async (table, col) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [table, col] },
      );
      return r.length > 0;
    };

    if (!(await hasColumn('CandidateProfiles', 'freelance_active'))) {
      await queryInterface.addColumn('CandidateProfiles', 'freelance_active', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('CandidateProfiles', 'freelance_active').catch(() => {});
  },
};
