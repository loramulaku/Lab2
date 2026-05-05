const Invitation        = require('../models/sql/Invitation');
const Company           = require('../models/sql/Company');
const User              = require('../models/sql/User');
const Job               = require('../models/sql/Job');
const invitationViewRepo = require('../repositories/mongodb/invitationView.repo');

async function syncInvitation(invitationId) {
  const inv = await Invitation.findByPk(invitationId);
  if (!inv) {
    await invitationViewRepo.delete(invitationId);
    return;
  }

  const company   = inv.companyId    ? await Company.findByPk(inv.companyId)       : null;
  const freelancer = inv.freelancerId ? await User.findByPk(inv.freelancerId)        : null;
  const job       = inv.jobId        ? await Job.findByPk(inv.jobId)               : null;

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
    companyName:         company?.name           ?? null,
    freelancerFirstName: freelancer?.firstName   ?? null,
    freelancerLastName:  freelancer?.lastName    ?? null,
    jobTitle:            job?.title              ?? null,
  });
}

function syncInvitationSafe(invitationId) {
  syncInvitation(invitationId).catch(err =>
    console.error(`[invitationSync] Failed to sync invitationId=${invitationId}:`, err.message)
  );
}

module.exports = { syncInvitation, syncInvitationSafe };
