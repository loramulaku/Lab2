const Bid     = require('../../../models/sql/Bid');
const Job     = require('../../../models/sql/Job');
const ContractService = require('../../_shared/ContractService');
const { httpError }   = ContractService;
const { syncBidSafe }      = require('../../../sync/bidSync');
const { syncJobSafe }      = require('../../../sync/jobSync');
const { syncContractSafe } = require('../../../sync/contractSync');
const { syncInvitationSafe } = require('../../../sync/invitationSync');
const { notify }             = require('../../../utils/notify');

/**
 * Recruiter accepts a bid → creates the Contract (Mode A win).
 * Delegates the transactional close+reject to ContractService so the
 * invite-accept path stays identical.
 */
class AcceptBidHandler {
  async handle(command) {
    const bid = await Bid.findByPk(command.bidId);
    if (!bid) throw httpError(404, 'Bid not found', 'BID_NOT_FOUND');

    const job = await Job.findByPk(bid.jobId);
    if (!job) throw httpError(404, 'Job not found', 'JOB_NOT_FOUND');
    if (job.companyId !== command.companyId) {
      throw httpError(403, 'You do not own this job', 'FORBIDDEN');
    }
    if (bid.status !== 'pending') {
      throw httpError(409, `Bid is already ${bid.status}`, 'BID_NOT_PENDING');
    }

    const result = await ContractService.createFromOffer({
      source:           'bid',
      jobId:            bid.jobId,
      freelancerId:     bid.freelancerId,
      companyId:        job.companyId,
      agreedPrice:      bid.price,
      deliveryTimeDays: bid.deliveryTimeDays,
      bidId:            bid.id,
    });

    // Re-project everything the transaction touched.
    syncContractSafe(result.contract.id);
    syncJobSafe(bid.jobId);
    syncBidSafe(bid.id);
    result.rejectedBidIds.forEach(syncBidSafe);
    result.rejectedInvitationIds.forEach(syncInvitationSafe);

    notify({ userId: bid.freelancerId, type: 'bid_accepted', message: 'Oferta juaj u pranua!' });

    return result.contract;
  }
}

module.exports = new AcceptBidHandler();
