'use strict';

/**
 * FEATURE 2 — standard-employment "Apply for a job" flow.
 *
 *  Applications : UNIQUE(job_id, user_id)  → prevents duplicate applications
 *                 interview_at DATETIME    → set when a recruiter schedules an interview
 *
 * Additive + idempotent. Never modify earlier migrations.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const seq = queryInterface.sequelize;
    const q = (sql) => seq.query(sql);

    const hasColumn = async (table, col) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [table, col] },
      );
      return r.length > 0;
    };
    const hasIndex = async (table, idx) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        { replacements: [table, idx] },
      );
      return r.length > 0;
    };

    if (!(await hasColumn('Applications', 'interview_at'))) {
      await queryInterface.addColumn('Applications', 'interview_at', { type: Sequelize.DATE, allowNull: true });
    }
    if (!(await hasIndex('Applications', 'uq_application_job_user'))) {
      await q('ALTER TABLE Applications ADD UNIQUE KEY uq_application_job_user (job_id, user_id)');
    }
    if (!(await hasIndex('Applications', 'idx_applications_user'))) {
      await q('ALTER TABLE Applications ADD INDEX idx_applications_user (user_id)');
    }
  },

  async down(queryInterface) {
    const seq = queryInterface.sequelize;
    const q = (sql) => seq.query(sql).catch(() => {});
    await q('ALTER TABLE Applications DROP INDEX uq_application_job_user');
    await q('ALTER TABLE Applications DROP INDEX idx_applications_user');
    await queryInterface.removeColumn('Applications', 'interview_at').catch(() => {});
  },
};
