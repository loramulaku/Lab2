const Bid             = require('../../../models/sql/Bid');
const jobMysqlRepo    = require('../../../repositories/mysql/job.repo');
const { notify }      = require('../../../utils/notify');
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

    if (job.recruiterId) {
      notify({ userId: job.recruiterId, type: 'new_bid', message: 'Një kandidat ka dërguar një ofertë për punën tuaj' });
    }

    return bid;
  }
}

module.exports = new SubmitBidHandler();
