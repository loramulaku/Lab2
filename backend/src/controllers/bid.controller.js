const SubmitBidCommand   = require('../application/bid/commands/SubmitBid.command');
const AcceptBidCommand   = require('../application/bid/commands/AcceptBid.command');
const RejectBidCommand   = require('../application/bid/commands/RejectBid.command');
const WithdrawBidCommand = require('../application/bid/commands/WithdrawBid.command');
const GetBidsByJobQuery  = require('../application/bid/queries/GetBidsByJob.query');
const GetMyBidsQuery     = require('../application/bid/queries/GetMyBids.query');

const submitBidHandler     = require('../application/bid/handlers/SubmitBidHandler');
const acceptBidHandler     = require('../application/bid/handlers/AcceptBidHandler');
const rejectBidHandler     = require('../application/bid/handlers/RejectBidHandler');
const withdrawBidHandler   = require('../application/bid/handlers/WithdrawBidHandler');
const getBidsByJobHandler  = require('../application/bid/handlers/GetBidsByJobHandler');
const getMyBidsHandler     = require('../application/bid/handlers/GetMyBidsHandler');

const BidDTO       = require('../dtos/bid.dto');
const ContractDTO  = require('../dtos/contract.dto');
const auditLog     = require('../utils/audit');

const submit = async (req, res, next) => {
  try {
    const r = await submitBidHandler.handle(new SubmitBidCommand({
      ...req.body,
      jobId:        Number(req.params.jobId),
      freelancerId: req.user.id,
    }));
    auditLog(req, { action: 'BID_SUBMIT', entity: 'Bid', entityId: r.id, newValue: JSON.stringify({ price: r.price, status: r.status }) });
    res.status(201).json(BidDTO.from(r));
  } catch (err) { next(err); }
};

const listByJob = (req, res, next) =>
  getBidsByJobHandler.handle(new GetBidsByJobQuery(Number(req.params.jobId), req.query))
    .then(r => res.json({ ...r, data: BidDTO.fromList(r.data) }))
    .catch(next);

const listMine = (req, res, next) =>
  getMyBidsHandler.handle(new GetMyBidsQuery(req.user.id, req.query))
    .then(r => res.json({ ...r, data: BidDTO.fromList(r.data) }))
    .catch(next);

const accept = async (req, res, next) => {
  try {
    const bidId = Number(req.params.bidId);
    const r = await acceptBidHandler.handle(new AcceptBidCommand(bidId, req.user.companyId));
    auditLog(req, { action: 'BID_ACCEPT', entity: 'Bid', entityId: bidId });
    res.status(201).json(ContractDTO.from(r));
  } catch (err) { next(err); }
};

const reject = (req, res, next) =>
  rejectBidHandler.handle(new RejectBidCommand(Number(req.params.bidId), req.user.companyId))
    .then(r => res.json(BidDTO.from(r)))
    .catch(next);

const withdraw = (req, res, next) =>
  withdrawBidHandler.handle(new WithdrawBidCommand(Number(req.params.bidId), req.user.id))
    .then(r => res.json(BidDTO.from(r)))
    .catch(next);

module.exports = { submit, listByJob, listMine, accept, reject, withdraw };
