'use strict';

/**
 * Documents that 'internship' is a valid employment_type value.
 *
 * employment_type is VARCHAR(50) — no schema change is required to accept
 * new string values. Existing rows are unaffected. This migration exists so
 * the change is tracked in the migration history and is revertible.
 */
module.exports = {
  async up(queryInterface) {
    // Verify the column exists and is VARCHAR (safety check only — no DDL change).
    const [rows] = await queryInterface.sequelize.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME   = 'Jobs'
         AND COLUMN_NAME  = 'employment_type'`,
    );
    const colType = rows[0]?.COLUMN_TYPE ?? '';
    if (!colType.toLowerCase().startsWith('varchar')) {
      throw new Error(`Unexpected employment_type column type: ${colType}. Manual review required.`);
    }
    // VARCHAR(50) already accepts 'internship' — nothing else to change.
  },

  async down() {
    // Nothing to revert: VARCHAR(50) is unchanged.
  },
};
