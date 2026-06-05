'use strict';

/**
 * Adds four optional rich-text sections to the Jobs table:
 *   responsibilities, requirements, nice_to_have, benefits
 * All nullable TEXT — existing rows are unaffected.
 */
module.exports = {
  async up(queryInterface) {
    const seq = queryInterface.sequelize;
    const has = async (col) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Jobs' AND COLUMN_NAME = ?`,
        { replacements: [col] },
      );
      return r.length > 0;
    };
    if (!(await has('responsibilities'))) await seq.query(`ALTER TABLE Jobs ADD COLUMN responsibilities TEXT NULL`);
    if (!(await has('requirements')))     await seq.query(`ALTER TABLE Jobs ADD COLUMN requirements     TEXT NULL`);
    if (!(await has('nice_to_have')))     await seq.query(`ALTER TABLE Jobs ADD COLUMN nice_to_have     TEXT NULL`);
    if (!(await has('benefits')))         await seq.query(`ALTER TABLE Jobs ADD COLUMN benefits         TEXT NULL`);
  },
  async down(queryInterface) {
    const seq = queryInterface.sequelize;
    for (const col of ['responsibilities','requirements','nice_to_have','benefits']) {
      await seq.query(`ALTER TABLE Jobs DROP COLUMN IF EXISTS ${col}`).catch(() => {});
    }
  },
};
