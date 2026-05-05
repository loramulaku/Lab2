const Bid         = require('../models/sql/Bid');
const Job         = require('../models/sql/Job');
const Company     = require('../models/sql/Company');
const User        = require('../models/sql/User');
const bidViewRepo = require('../repositories/mongodb/bidView.repo');

async function syncBid(bidId) {
  const bid = await Bid.findByPk(bidId);
  if (!bid) {
    await bidViewRepo.delete(bidId);
    return;
  }

  const job     = bid.jobId       ? await Job.findByPk(bid.jobId)         : null;
  const company = job?.companyId  ? await Company.findByPk(job.companyId) : null;
  const user    = bid.freelancerId ? await User.findByPk(bid.freelancerId) : null;

  await bidViewRepo.upsert({
    id:                   bid.id,
    jobId:                bid.jobId,
    freelancerId:         bid.freelancerId,
    price:                bid.price ? Number(bid.price) : null,
    message:              bid.message,
    status:               bid.status,
    deliveryTimeDays:     bid.deliveryTimeDays,
    invitationId:         bid.invitationId,
    createdAt:            bid.createdAt,
    jobTitle:             job?.title              ?? null,
    companyName:          company?.name           ?? null,
    freelancerFirstName:  user?.firstName         ?? null,
    freelancerLastName:   user?.lastName          ?? null,
  });
}

function syncBidSafe(bidId) {
  syncBid(bidId).catch(err =>
    console.error(`[bidSync] Failed to sync bidId=${bidId}:`, err.message)
  );
}

module.exports = { syncBid, syncBidSafe };
