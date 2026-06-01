/**
 * invitationSync — CQRS read-side projection for Invitations.
 * Called after every MySQL write that changes an Invitation.
 */
const Invitation = require('../models/sql/Invitation');
const Job        = require('../models/sql/Job');
const Company    = require('../models/sql/Company');
const User       = require('../models/sql/User');
const FailedSync = require('../models/sql/FailedSync');
const invitationViewRepo = require('../repositories/mongodb/invitation.repo');

async function syncInvitation(invitationId) {
  const inv = await Invitation.findByPk(invitationId);
  if (!inv) {
    await invitationViewRepo.delete(invitationId);
    return;
  }

  const job        = inv.jobId ? await Job.findByPk(inv.jobId) : null;
  const company    = inv.companyId ? await Company.findByPk(inv.companyId) : null;
  const freelancer = inv.freelancerId ? await User.findByPk(inv.freelancerId) : null;

  await invitationViewRepo.upsert({
    id:                  inv.id,
    companyId:           inv.companyId,
    freelancerId:        inv.freelancerId,
    jobId:               inv.jobId,
    message:             inv.message,
    priceOffer:          inv.priceOffer ? Number(inv.priceOffer) : null,
    deliveryTimeDays:    inv.deliveryTimeDays,
    status:              inv.status,
    createdAt:           inv.createdAt,
    companyName:         company?.name ?? null,
    freelancerFirstName: freelancer?.firstName ?? null,
    freelancerLastName:  freelancer?.lastName ?? null,
    jobTitle:            job?.title ?? inv.title ?? null,
  });

  await FailedSync.destroy({ where: { entityType: 'invitation', entityId: invitationId } });
}

function syncInvitationSafe(invitationId) {
  syncInvitation(invitationId).catch(async (err) => {
    console.error(`[invitationSync] Failed to sync invitationId=${invitationId}:`, err.message);
    await recordFailure('invitation', invitationId, err).catch(() => {});
  });
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

module.exports = { syncInvitation, syncInvitationSafe };
