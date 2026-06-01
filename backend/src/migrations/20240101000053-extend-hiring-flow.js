'use strict';

/**
 * Hybrid hiring flow (Modes A/B/C) — additive, idempotent schema changes.
 *
 *  Jobs        : lifecycle timestamps (closed_at, archived_at, updated_at).
 *  Bids        : cover_letter + timestamps + UNIQUE(job_id, freelancer_id).
 *  Invitations : title, expiry/response timestamps + UNIQUE open invite per (job, freelancer).
 *  Contracts   : invitation_id, source, created_at + UNIQUE one ACTIVE contract per job.
 *
 * The two generated `active_key` columns are the race-proof invariants:
 *   - Invitations.active_key : at most one PENDING invite per (job, freelancer)
 *   - Contracts.active_key   : at most one ACTIVE contract per job  (edge case #5)
 *
 * Every change is guarded against pre-existing state so the migration is safe
 * to (re)run on a database that already has some of these columns.
 */
module.exports = {
  async up(queryInterface) {
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
    const hasConstraint = async (table, name) => {
      const [r] = await seq.query(
        `SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
        { replacements: [table, name] },
      );
      return r.length > 0;
    };
    const addCol = async (table, col, ddl) => {
      if (!(await hasColumn(table, col))) await q(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    };
    const addIdx = async (table, idx, ddl) => {
      if (!(await hasIndex(table, idx))) await q(`ALTER TABLE ${table} ADD ${ddl}`);
    };

    // ── Jobs ──────────────────────────────────────────────────────────────────
    await addCol('Jobs', 'closed_at',   'closed_at   DATETIME NULL');
    await addCol('Jobs', 'archived_at', 'archived_at DATETIME NULL');
    await addCol('Jobs', 'updated_at',  'updated_at  DATETIME NULL');
    await addIdx('Jobs', 'idx_jobs_company_status', 'INDEX idx_jobs_company_status (company_id, status)');
    await addIdx('Jobs', 'idx_jobs_visibility',     'INDEX idx_jobs_visibility (employment_type, job_mode, status)');

    // ── Bids ──────────────────────────────────────────────────────────────────
    await addCol('Bids', 'cover_letter', 'cover_letter TEXT NULL');
    await addCol('Bids', 'created_at',   'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    await addCol('Bids', 'updated_at',   'updated_at DATETIME NULL');
    await addIdx('Bids', 'uq_bid_job_freelancer', 'UNIQUE KEY uq_bid_job_freelancer (job_id, freelancer_id)');
    await addIdx('Bids', 'idx_bids_job_status',    'INDEX idx_bids_job_status (job_id, status)');

    // ── Invitations ─────────────────────────────────────────────────────────────
    await addCol('Invitations', 'title',        'title        VARCHAR(255) NULL');
    await addCol('Invitations', 'expires_at',   'expires_at   DATETIME NULL');
    await addCol('Invitations', 'responded_at', 'responded_at DATETIME NULL');
    await addCol('Invitations', 'updated_at',   'updated_at   DATETIME NULL');
    // active_key is maintained by the application (set while PENDING, NULLed on
    // terminal transitions). A plain nullable column + UNIQUE gives the same
    // "one open invite per (job, freelancer)" guarantee; MySQL allows many NULLs.
    // (A STORED generated column can't be added here — an inbound FK from Bids
    //  forces a table copy that fails to re-validate the constraint.)
    await addCol('Invitations', 'active_key', 'active_key VARCHAR(64) NULL');
    await addIdx('Invitations', 'uq_invite_open', 'UNIQUE KEY uq_invite_open (active_key)');
    await addIdx('Invitations', 'idx_invites_freelancer_status', 'INDEX idx_invites_freelancer_status (freelancer_id, status)');
    await addIdx('Invitations', 'idx_invites_company_status',    'INDEX idx_invites_company_status (company_id, status)');

    // ── Contracts ───────────────────────────────────────────────────────────────
    await addCol('Contracts', 'invitation_id', 'invitation_id INT NULL');
    await addCol('Contracts', 'source',        `source VARCHAR(20) NOT NULL DEFAULT 'bid'`);
    await addCol('Contracts', 'created_at',    'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    if (!(await hasConstraint('Contracts', 'fk_contract_invitation'))) {
      await q(`ALTER TABLE Contracts
        ADD CONSTRAINT fk_contract_invitation
        FOREIGN KEY (invitation_id) REFERENCES Invitations(id) ON DELETE SET NULL`);
    }
    // active_key set to 'job:<id>' while status='active', NULLed otherwise — the
    // race-proof "one active contract per job" guard (edge case #5).
    await addCol('Contracts', 'active_key', 'active_key VARCHAR(32) NULL');
    await addIdx('Contracts', 'uq_one_active_contract_per_job', 'UNIQUE KEY uq_one_active_contract_per_job (active_key)');
  },

  async down(queryInterface) {
    const seq = queryInterface.sequelize;
    const q = (sql) => seq.query(sql).catch(() => {});

    await q(`ALTER TABLE Contracts DROP INDEX uq_one_active_contract_per_job`);
    await q(`ALTER TABLE Contracts DROP COLUMN active_key`);
    await q(`ALTER TABLE Contracts DROP FOREIGN KEY fk_contract_invitation`);
    await q(`ALTER TABLE Contracts DROP COLUMN invitation_id`);
    await q(`ALTER TABLE Contracts DROP COLUMN source`);
    await q(`ALTER TABLE Contracts DROP COLUMN created_at`);

    await q(`ALTER TABLE Invitations DROP INDEX uq_invite_open`);
    await q(`ALTER TABLE Invitations DROP COLUMN active_key`);
    await q(`ALTER TABLE Invitations DROP INDEX idx_invites_freelancer_status`);
    await q(`ALTER TABLE Invitations DROP INDEX idx_invites_company_status`);
    await q(`ALTER TABLE Invitations DROP COLUMN title`);
    await q(`ALTER TABLE Invitations DROP COLUMN expires_at`);
    await q(`ALTER TABLE Invitations DROP COLUMN responded_at`);
    await q(`ALTER TABLE Invitations DROP COLUMN updated_at`);

    await q(`ALTER TABLE Bids DROP INDEX uq_bid_job_freelancer`);
    await q(`ALTER TABLE Bids DROP INDEX idx_bids_job_status`);
    await q(`ALTER TABLE Bids DROP COLUMN cover_letter`);
    await q(`ALTER TABLE Bids DROP COLUMN updated_at`);

    await q(`ALTER TABLE Jobs DROP INDEX idx_jobs_company_status`);
    await q(`ALTER TABLE Jobs DROP INDEX idx_jobs_visibility`);
    await q(`ALTER TABLE Jobs DROP COLUMN closed_at`);
    await q(`ALTER TABLE Jobs DROP COLUMN archived_at`);
    await q(`ALTER TABLE Jobs DROP COLUMN updated_at`);
  },
};
