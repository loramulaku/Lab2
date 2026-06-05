'use strict';

/**
 * Adds a nullable JSON column `schedule` to the Jobs table.
 * Used for Internship postings to store a weekly schedule:
 *   { days: ['Mon','Tue','Wed','Thu','Fri'], startTime: '09:00', endTime: '17:00' }
 * Existing rows are unaffected (NULL default).
 */
module.exports = {
  async up(queryInterface) {
    const seq = queryInterface.sequelize;
    const [rows] = await seq.query(
      `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Jobs' AND COLUMN_NAME = 'schedule'`,
    );
    if (!rows.length) {
      await seq.query(`ALTER TABLE Jobs ADD COLUMN schedule JSON NULL`);
    }
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE Jobs DROP COLUMN IF EXISTS schedule`,
    );
  },
};
