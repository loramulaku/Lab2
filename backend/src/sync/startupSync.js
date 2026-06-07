/**
 * startupSync — reconciles MySQL with MongoDB on every server boot.
 *
 * Runs after both databases are connected. For each entity type, it fetches
 * all IDs from MySQL, fetches all IDs from the corresponding MongoDB
 * collection, and fires syncSafe() for any record that is missing from Mongo.
 *
 * All syncs are fire-and-forget; failures are written to FailedSyncs.
 * This handles manually-inserted rows and any records whose sync was lost.
 */

const Application    = require('../models/sql/Application');
const ApplicationView = require('../models/nosql/ApplicationView');
const { syncApplicationSafe } = require('./applicationSync');

const Bid     = require('../models/sql/Bid');
const BidView = require('../models/nosql/BidView');
const { syncBidSafe } = require('./bidSync');

const Job     = require('../models/sql/Job');
const JobView = require('../models/nosql/JobView');
const { syncJobSafe } = require('./jobSync');

async function reconcile(label, mysqlIds, mongoIds, syncFn) {
  const mongoSet   = new Set(mongoIds.map(Number));
  const missing    = mysqlIds.filter(id => !mongoSet.has(Number(id)));
  if (missing.length === 0) {
    console.log(`[startupSync] ${label}: all ${mysqlIds.length} records in sync.`);
    return;
  }
  console.log(`[startupSync] ${label}: ${missing.length} record(s) missing from MongoDB — syncing.`);
  missing.forEach(id => syncFn(id));
}

async function startupSync() {
  try {
    console.log('[startupSync] Running reconciliation check…');

    const [
      mysqlAppIds,   mongoAppIds,
      mysqlBidIds,   mongoBidIds,
      mysqlJobIds,   mongoJobIds,
    ] = await Promise.all([
      Application.findAll({ attributes: ['id'], raw: true }).then(r => r.map(x => x.id)),
      ApplicationView.distinct('_id'),
      Bid.findAll({ attributes: ['id'], raw: true }).then(r => r.map(x => x.id)),
      BidView.distinct('_id'),
      Job.findAll({ attributes: ['id'], raw: true }).then(r => r.map(x => x.id)),
      JobView.distinct('_id'),
    ]);

    await Promise.all([
      reconcile('Applications', mysqlAppIds, mongoAppIds, syncApplicationSafe),
      reconcile('Bids',         mysqlBidIds, mongoBidIds, syncBidSafe),
      reconcile('Jobs',         mysqlJobIds, mongoJobIds, syncJobSafe),
    ]);

    console.log('[startupSync] Reconciliation complete.');
  } catch (err) {
    console.error('[startupSync] Reconciliation failed:', err.message);
  }
}

module.exports = { startupSync };
