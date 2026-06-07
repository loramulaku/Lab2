const Notification       = require('../models/sql/Notification');
const FailedSync         = require('../models/sql/FailedSync');
const notificationViewRepo = require('../repositories/mongodb/notification.repo');

async function syncNotification(notificationId) {
  const n = await Notification.findByPk(notificationId);
  if (!n) {
    await notificationViewRepo.delete(notificationId);
    return;
  }

  await notificationViewRepo.upsert({
    id:        n.id,
    userId:    n.userId,
    type:      n.type,
    message:   n.message,
    link:      n.link ?? null,
    isRead:    n.isRead,
    createdAt: n.createdAt,
  });

  await FailedSync.destroy({ where: { entityType: 'notification', entityId: notificationId } });
}

async function recordFailure(entityType, entityId, err) {
  const [record, created] = await FailedSync.findOrCreate({
    where: { entityType, entityId },
    defaults: {
      entityType, entityId,
      errorMessage: err.message, attempts: 1,
      lastAttemptedAt: new Date(), createdAt: new Date(),
    },
  });
  if (!created) {
    await record.update({
      errorMessage: err.message, attempts: record.attempts + 1,
      lastAttemptedAt: new Date(), resolvedAt: null,
    });
  }
}

function syncNotificationSafe(notificationId) {
  syncNotification(notificationId).catch(async (err) => {
    console.error(`[notificationSync] Failed for id=${notificationId}:`, err.message);
    await recordFailure('notification', notificationId, err).catch(() => {});
  });
}

module.exports = { syncNotification, syncNotificationSafe };
