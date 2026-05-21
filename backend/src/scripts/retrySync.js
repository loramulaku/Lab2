/**
 * retrySync — re-runs pending CQRS sync operations that previously failed.
 *
 * Usage:
 *   node src/scripts/retrySync.js
 *
 * Queries all unresolved FailedSyncs rows, calls the appropriate sync
 * function for each entity type, and marks the row resolved on success
 * (or updates the error + attempt count on continued failure).
 *
 * Entity types handled: user | candidate | recruiter | job
 *
 * Safe to run repeatedly — idempotent on the read store.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { connectMySQL }   = require('../config/mysql');
const { connectMongoDB } = require('../config/mongodb');
const FailedSync         = require('../models/sql/FailedSync');
const { syncUser }       = require('../sync/userSync');
const { syncCandidate }  = require('../sync/candidateSync');
const { syncRecruiter }  = require('../sync/recruiterSync');
const { syncJob }        = require('../sync/jobSync');
const { Op }             = require('sequelize');

const SYNC_FN = {
  user:      (id) => syncUser(id),
  candidate: (id) => syncCandidate(id),
  recruiter: (id) => syncRecruiter(id),
  job:       (id) => syncJob(id),
};

async function run() {
  await connectMySQL();
  await connectMongoDB();

  const pending = await FailedSync.findAll({
    where: { resolvedAt: { [Op.is]: null } },
    order: [['last_attempted_at', 'ASC']],
  });

  if (!pending.length) {
    console.log('[retrySync] No pending failures — nothing to do.');
    process.exit(0);
  }

  console.log(`[retrySync] Found ${pending.length} unresolved record(s). Retrying…`);

  let resolved = 0;
  let failed   = 0;

  for (const record of pending) {
    const { entityType, entityId } = record;
    const syncFn = SYNC_FN[entityType];

    if (!syncFn) {
      console.warn(`[retrySync] Unknown entityType "${entityType}" — skipping id=${record.id}`);
      continue;
    }

    try {
      await syncFn(entityId);
      // syncFn already destroys the FailedSync row on success, but set
      // resolvedAt here as a belt-and-suspenders guard against race conditions.
      await record.update({ resolvedAt: new Date() }).catch(() => {});
      console.log(`[retrySync] ✓ ${entityType} id=${entityId} synced`);
      resolved++;
    } catch (err) {
      await record.update({
        errorMessage:    err.message,
        attempts:        record.attempts + 1,
        lastAttemptedAt: new Date(),
      });
      console.error(`[retrySync] ✗ ${entityType} id=${entityId} still failing:`, err.message);
      failed++;
    }
  }

  console.log(`[retrySync] Done — resolved: ${resolved}, still failing: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('[retrySync] Fatal error:', err);
  process.exit(1);
});
