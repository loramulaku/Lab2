const SubmitBidCommand    = require('../application/commands/SubmitBid.command');
const GetJobBidsQuery     = require('../application/queries/GetJobBids.query');
const GetMyBidsQuery      = require('../application/queries/GetMyBids.query');
const submitBidHandler    = require('../application/handlers/SubmitBidHandler');
const getJobBidsHandler   = require('../application/handlers/GetJobBidsHandler');
const getMyBidsHandler    = require('../application/handlers/GetMyBidsHandler');
const BidDTO              = require('../dtos/bid.dto');

const bidController = {
  async submit(req, res) {
    const command = new SubmitBidCommand({
      jobId:            Number(req.params.jobId),
      freelancerId:     req.user.id,
      price:            Number(req.body.price),
      deliveryTimeDays: Number(req.body.deliveryTimeDays),
      message:          req.body.message,
    });
    const bid = await submitBidHandler.handle(command);
    return res.status(201).json(BidDTO.from(bid));
  },

  async getForJob(req, res) {
    const query  = new GetJobBidsQuery({ jobId: Number(req.params.jobId), ...req.query });
    const result = await getJobBidsHandler.handle(query);
    return res.json({ ...result, data: BidDTO.fromList(result.data) });
  },

  async getMine(req, res) {
    const query  = new GetMyBidsQuery({ userId: req.user.id, ...req.query });
    const result = await getMyBidsHandler.handle(query);
    return res.json({ ...result, data: BidDTO.fromList(result.data) });
  },
};

module.exports = bidController;
