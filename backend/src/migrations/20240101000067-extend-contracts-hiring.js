'use strict';

/**
 * Extend Contracts for the two-step hiring flow:
 *   application_id  — links a standard-employment (pipeline) contract to the Application
 *   approved_at     — timestamp set when the freelancer/candidate approves the contract
 */
module.exports = {
  async up(queryInterface) {
    const seq = queryInterface.sequelize;

    const hasColumn = async (table, col) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        { replacements: [table, col] },
      );
      return r.length > 0;
    };
    const hasConstraint = async (table, name) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
        { replacements: [table, name] },
      );
      return r.length > 0;
    };

    if (!(await hasColumn('Contracts', 'application_id'))) {
      await seq.query(`ALTER TABLE Contracts ADD COLUMN application_id INT NULL`);
    }
    if (!(await hasConstraint('Contracts', 'fk_contract_application'))) {
      await seq.query(`ALTER TABLE Contracts
        ADD CONSTRAINT fk_contract_application
        FOREIGN KEY (application_id) REFERENCES Applications(id) ON DELETE SET NULL`);
    }
    if (!(await hasColumn('Contracts', 'approved_at'))) {
      await seq.query(`ALTER TABLE Contracts ADD COLUMN approved_at DATETIME NULL`);
    }
  },

  async down(queryInterface) {
    const seq = queryInterface.sequelize;
    const q = (sql) => seq.query(sql).catch(() => {});
    await q(`ALTER TABLE Contracts DROP FOREIGN KEY fk_contract_application`);
    await q(`ALTER TABLE Contracts DROP COLUMN application_id`);
    await q(`ALTER TABLE Contracts DROP COLUMN approved_at`);
  },
};
