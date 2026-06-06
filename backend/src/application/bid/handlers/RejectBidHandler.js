const Bid = require('../../../models/sql/Bid');
const Job = require('../../../models/sql/Job');
const { httpError }   = require('../../_shared/ContractService');
const { syncBidSafe } = require('../../../sync/bidSync');
const { notify }      = require('../../../utils/notify');

class RejectBidHandler {
  async handle(command) {
    const bid = await Bid.findByPk(command.bidId);
    if (!bid) throw httpError(404, 'Bid not found', 'BID_NOT_FOUND');

    const job = await Job.findByPk(bid.jobId);
    if (!job || job.companyId !== command.companyId) {
      throw httpError(403, 'You do not own this job', 'FORBIDDEN');
    }
    if (bid.status !== 'pending') {
      throw httpError(409, `Bid is already ${bid.status}`, 'BID_NOT_PENDING');
    }

    await bid.update({ status: 'rejected', updatedAt: new Date() });
    syncBidSafe(bid.id);
    notify({ userId: bid.freelancerId, type: 'bid_rejected', message: 'Oferta juaj nuk u pranua' });
    return bid;
  }
}

module.exports = new RejectBidHandler();
