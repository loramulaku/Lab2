const Bid = require('../../../models/sql/Bid');
const { httpError }   = require('../../_shared/ContractService');
const { syncBidSafe } = require('../../../sync/bidSync');

class WithdrawBidHandler {
  async handle(command) {
    const bid = await Bid.findByPk(command.bidId);
    if (!bid) throw httpError(404, 'Bid not found', 'BID_NOT_FOUND');
    if (bid.freelancerId !== command.freelancerId) {
      throw httpError(403, 'This is not your bid', 'FORBIDDEN');
    }
    if (bid.status !== 'pending') {
      throw httpError(409, `Bid is already ${bid.status}`, 'BID_NOT_PENDING');
    }

    await bid.update({ status: 'withdrawn', updatedAt: new Date() });
    syncBidSafe(bid.id);
    return bid;
  }
}

module.exports = new WithdrawBidHandler();
