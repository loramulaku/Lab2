/**
 * siteContentSync — CQRS read-side projection for SiteContent.
 *
 * Called after every MySQL write that changes a SiteContent row.
 * Re-reads the canonical row from MySQL and upserts it into the
 * MongoDB read collection so the public site always sees fresh values.
 */

const SiteContent       = require('../models/sql/SiteContent');
const FailedSync        = require('../models/sql/FailedSync');
const siteContentViewRepo = require('../repositories/mongodb/siteContentView.repo');

async function syncSiteContent(id) {
  const row = await SiteContent.findByPk(id);
  if (!row) {
    // Row deleted — try to remove view by id-keyed lookup. We don't have key
    // here, so projector callers must call deleteSiteContentView(key) directly
    // when deleting. For safety, no-op when row missing.
    return;
  }

  await siteContentViewRepo.upsert({
    id:        row.id,
    key:       row.key,
    value:     row.value,
    label:     row.label,
    updatedAt: row.updatedAt,
  });

  await FailedSync.destroy({ where: { entityType: 'siteContent', entityId: id } });
}

async function deleteSiteContentView(key) {
  await siteContentViewRepo.deleteByKey(key);
}

function syncSiteContentSafe(id) {
  syncSiteContent(id).catch(async (err) => {
    console.error(`[siteContentSync] Failed to sync id=${id}:`, err.message);
    try {
      const [record, created] = await FailedSync.findOrCreate({
        where: { entityType: 'siteContent', entityId: id },
        defaults: {
          entityType:      'siteContent',
          entityId:        id,
          errorMessage:    err.message,
          attempts:        1,
          lastAttemptedAt: new Date(),
          createdAt:       new Date(),
        },
      });
      if (!created) {
        await record.update({
          errorMessage:    err.message,
          attempts:        record.attempts + 1,
          lastAttemptedAt: new Date(),
          resolvedAt:      null,
        });
      }
    } catch (dbErr) {
      console.error('[siteContentSync] Could not write to FailedSyncs:', dbErr.message);
    }
  });
}

module.exports = { syncSiteContent, syncSiteContentSafe, deleteSiteContentView };
