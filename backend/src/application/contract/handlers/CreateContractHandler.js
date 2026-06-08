const Contract     = require('../../../models/sql/Contract');
const Bid          = require('../../../models/sql/Bid');
const Invitation   = require('../../../models/sql/Invitation');
const Application  = require('../../../models/sql/Application');
const Job          = require('../../../models/sql/Job');
const { httpError } = require('../../_shared/ContractService');
const { syncContractSafe } = require('../../../sync/contractSync');

/**
 * Recruiter creates a contract draft (status = 'pending').
 * The hiring is not completed until the freelancer/candidate calls ApproveContract.
 *
 * source='bid'        → bidId required; freelancerId/jobId resolved from Bid
 * source='invitation' → invitationId required; freelancerId/jobId resolved from Invitation
 * source='pipeline'   → applicationId required; freelancerId/jobId resolved from Application
 */
class CreateContractHandler {
  async handle(command) {
    const { companyId, source, bidId, invitationId, applicationId, agreedPrice, startDate, endDate } = command;

    let freelancerId, jobId;

    if (source === 'bid') {
      if (!bidId) throw httpError(400, 'bidId required for source=bid', 'MISSING_BID_ID');
      const bid = await Bid.findByPk(bidId);
      if (!bid) throw httpError(404, 'Bid not found', 'BID_NOT_FOUND');

      const job = await Job.findByPk(bid.jobId);
      if (!job || job.companyId !== companyId) throw httpError(403, 'You do not own this job', 'FORBIDDEN');
      if (bid.status !== 'pending') throw httpError(409, `Bid is already ${bid.status}`, 'BID_NOT_PENDING');

      freelancerId = bid.freelancerId;
      jobId        = bid.jobId;

    } else if (source === 'invitation') {
      if (!invitationId) throw httpError(400, 'invitationId required for source=invitation', 'MISSING_INVITATION_ID');
      const inv = await Invitation.findByPk(invitationId);
      if (!inv) throw httpError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
      if (inv.companyId !== companyId) throw httpError(403, 'You do not own this invitation', 'FORBIDDEN');
      if (inv.status === 'revoked' || inv.status === 'rejected') {
        throw httpError(409, `Invitation is already ${inv.status}`, 'INVITATION_NOT_ACTIVE');
      }

      freelancerId = inv.freelancerId;
      jobId        = inv.jobId ?? null;

    } else if (source === 'pipeline') {
      if (!applicationId) throw httpError(400, 'applicationId required for source=pipeline', 'MISSING_APPLICATION_ID');
      const app = await Application.findByPk(applicationId);
      if (!app) throw httpError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

      const job = await Job.findByPk(app.jobId);
      if (!job || job.companyId !== companyId) throw httpError(403, 'You do not own this job', 'FORBIDDEN');
      if (app.status === 'hired') throw httpError(409, 'Candidate is already hired', 'ALREADY_HIRED');

      freelancerId = app.userId;
      jobId        = app.jobId;

    } else {
      throw httpError(400, 'source must be bid, invitation, or pipeline', 'INVALID_SOURCE');
    }

    const contract = await Contract.create({
      jobId,
      freelancerId,
      companyId,
      bidId,
      invitationId,
      applicationId,
      source,
      agreedPrice,
      price: agreedPrice,
      startDate,
      endDate,
      status: 'pending',
      activeKey: null,
      createdAt: new Date(),
    });

    syncContractSafe(contract.id);
    return contract;
  }
}

module.exports = new CreateContractHandler();
