const jobMysqlRepo    = require('../../repositories/mysql/job.repo');
const bidRepo         = require('../../repositories/mysql/bid.repo');
const { syncBidSafe } = require('../../sync/bidSync');

class SubmitBidHandler {
  async handle(command) {
    const job = await jobMysqlRepo.findById(command.jobId);
    if (!job) {
      const err = new Error('Job not found'); err.status = 404; throw err;
    }
    if (job.status !== 'open') {
      const err = new Error('This job is no longer accepting bids'); err.status = 400; throw err;
    }
    if (job.employmentType !== 'freelance') {
      const err = new Error('This job is not a freelance posting'); err.status = 400; throw err;
    }
    if (job.jobMode === 'invite') {
      const err = new Error('This job is invite-only and does not accept public bids'); err.status = 400; throw err;
    }

    if (!command.price || command.price <= 0) {
      const err = new Error('price must be a positive number'); err.status = 400; throw err;
    }
    if (!command.deliveryTimeDays || command.deliveryTimeDays <= 0) {
      const err = new Error('deliveryTimeDays must be a positive number'); err.status = 400; throw err;
    }

    const duplicate = await bidRepo.findByJobAndFreelancer(command.jobId, command.freelancerId);
    if (duplicate) {
      const err = new Error('You have already submitted a bid for this job'); err.status = 409; throw err;
    }

    const bid = await bidRepo.create({
      jobId:            command.jobId,
      freelancerId:     command.freelancerId,
      price:            command.price,
      deliveryTimeDays: command.deliveryTimeDays,
      message:          command.message,
      status:           'pending',
      createdAt:        new Date(),
    });

    syncBidSafe(bid.id);
    return bid;
  }
}

module.exports = new SubmitBidHandler();
