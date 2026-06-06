/**
 * bidSync — CQRS read-side projection for Bids.
 * Mirrors jobSync: called after every MySQL write that changes a Bid,
 * upserts the denormalised BidView into MongoDB. Failures land in FailedSyncs.
 */
const Bid        = require('../models/sql/Bid');
const Job        = require('../models/sql/Job');
const Company    = require('../models/sql/Company');
const User       = require('../models/sql/User');
const FailedSync = require('../models/sql/FailedSync');
const bidViewRepo = require('../repositories/mongodb/bid.repo');
const JobView    = require('../models/nosql/JobView');

async function syncBid(bidId) {
  const bid = await Bid.findByPk(bidId);
  if (!bid) {
    await bidViewRepo.delete(bidId);
    return;
  }

  const job        = bid.jobId ? await Job.findByPk(bid.jobId) : null;
  const company    = job?.companyId ? await Company.findByPk(job.companyId) : null;
  const freelancer = bid.freelancerId ? await User.findByPk(bid.freelancerId) : null;

  await bidViewRepo.upsert({
    id:                  bid.id,
    jobId:               bid.jobId,
    freelancerId:        bid.freelancerId,
    price:               bid.price ? Number(bid.price) : null,
    message:             bid.message,
    status:              bid.status,
    deliveryTimeDays:    bid.deliveryTimeDays,
    bidType:             bid.bidType ?? 'fixed',
    hoursPerWeek:        bid.hoursPerWeek ?? null,
    startDate:           bid.startDate ?? null,
    milestones:          bid.milestones ?? null,
    portfolioLinks:      bid.portfolioLinks ?? null,
    skillsSnapshot:      bid.skillsSnapshot ?? null,
    companyId:           job?.companyId ?? null,
    jobTitle:            job?.title ?? null,
    companyName:         company?.name ?? null,
    freelancerFirstName: freelancer?.firstName ?? null,
    freelancerLastName:  freelancer?.lastName ?? null,
  });

  if (bid.jobId) {
    const count = await Bid.count({ where: { jobId: bid.jobId } });
    await JobView.updateOne({ _id: bid.jobId }, { $set: { bidCount: count } });
  }

  await FailedSync.destroy({ where: { entityType: 'bid', entityId: bidId } });
}

function syncBidSafe(bidId) {
  syncBid(bidId).catch(async (err) => {
    console.error(`[bidSync] Failed to sync bidId=${bidId}:`, err.message);
    await recordFailure('bid', bidId, err).catch(() => {});
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

module.exports = { syncBid, syncBidSafe };
