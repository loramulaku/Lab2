const Bid             = require('../../../models/sql/Bid');
const Notification    = require('../../../models/sql/Notification');
const jobMysqlRepo    = require('../../../repositories/mysql/job.repo');
const { bidsAllowed } = require('../../_shared/jobModePolicy');
const { httpError }   = require('../../_shared/ContractService');
const { syncBidSafe } = require('../../../sync/bidSync');

class SubmitBidHandler {
  async handle(command) {
    const job = await jobMysqlRepo.findById(command.jobId);
    if (!job) throw httpError(404, 'Job not found', 'JOB_NOT_FOUND');

    // Mode guard — bids only on public/both freelance jobs.
    if (!bidsAllowed(job)) {
      throw httpError(403, 'This job does not accept bids', 'BIDS_NOT_ALLOWED');
    }
    if (job.status !== 'open') {
      throw httpError(409, 'Job is not open for bids', 'JOB_NOT_OPEN');
    }
    const now = new Date();
    if ((job.expiresAt && now > job.expiresAt) || (job.deadline && now > job.deadline)) {
      throw httpError(409, 'Job posting has expired', 'JOB_EXPIRED');
    }
    if (job.recruiterId && job.recruiterId === command.freelancerId) {
      throw httpError(403, 'You cannot bid on your own job', 'SELF_BID');
    }
    if (!(command.price > 0) || !(command.deliveryTimeDays > 0)) {
      throw httpError(400, 'price and deliveryTimeDays must be positive', 'INVALID_BID');
    }

    let bid;
    try {
      bid = await Bid.create({
        jobId:            command.jobId,
        freelancerId:     command.freelancerId,
        price:            command.price,
        deliveryTimeDays: command.deliveryTimeDays,
        message:          command.message,
        coverLetter:      command.coverLetter,
        bidType:          command.bidType,
        hoursPerWeek:     command.hoursPerWeek,
        startDate:        command.startDate,
        milestones:       command.milestones,
        portfolioLinks:   command.portfolioLinks,
        skillsSnapshot:   command.skillsSnapshot,
        status:           'pending',
        createdAt:        now,
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw httpError(409, 'You have already bid on this job', 'ALREADY_BID');
      }
      throw err;
    }

    syncBidSafe(bid.id);

    // Notify the recruiter who owns the job (best-effort — never block the bid).
    if (job.recruiterId) {
      Notification.create({
        userId:    job.recruiterId,
        type:      'bid_received',
        message:   `New bid received on "${job.title}".`,
        createdAt: now,
      }).catch(() => {});
    }

    return bid;
  }
}

module.exports = new SubmitBidHandler();
