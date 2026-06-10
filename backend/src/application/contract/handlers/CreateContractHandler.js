const Contract     = require('../../../models/sql/Contract');
const Bid          = require('../../../models/sql/Bid');
const Invitation   = require('../../../models/sql/Invitation');
const Application  = require('../../../models/sql/Application');
const Job          = require('../../../models/sql/Job');
const { httpError } = require('../../_shared/ContractService');
const { syncContractSafe } = require('../../../sync/contractSync');
const CreateNotificationCommand = require('../../notification/commands/CreateNotification.command');
const createNotificationHandler = require('../../notification/handlers/CreateNotificationHandler');

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

    let freelancerId, jobId, pipelineJobTitle = null, freelanceJobTitle = null;

    if (source === 'bid') {
      if (!bidId) throw httpError(400, 'bidId required for source=bid', 'MISSING_BID_ID');
      const bid = await Bid.findByPk(bidId);
      if (!bid) throw httpError(404, 'Bid not found', 'BID_NOT_FOUND');

      const job = await Job.findByPk(bid.jobId);
      if (!job || job.companyId !== companyId) throw httpError(403, 'You do not own this job', 'FORBIDDEN');
      if (bid.status !== 'pending') throw httpError(409, `Bid is already ${bid.status}`, 'BID_NOT_PENDING');

      freelancerId      = bid.freelancerId;
      jobId             = bid.jobId;
      freelanceJobTitle = job.title;

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
      if (jobId) {
        const invJob = await Job.findByPk(jobId);
        freelanceJobTitle = invJob?.title ?? null;
      }

    } else if (source === 'pipeline') {
      if (!applicationId) throw httpError(400, 'applicationId required for source=pipeline', 'MISSING_APPLICATION_ID');
      const app = await Application.findByPk(applicationId);
      if (!app) throw httpError(404, 'Application not found', 'APPLICATION_NOT_FOUND');

      const job = await Job.findByPk(app.jobId);
      if (!job || job.companyId !== companyId) throw httpError(403, 'You do not own this job', 'FORBIDDEN');
      if (app.status === 'hired') throw httpError(409, 'Candidate is already hired', 'ALREADY_HIRED');

      freelancerId     = app.userId;
      jobId            = app.jobId;
      pipelineJobTitle = job.title;

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

    const startStr  = startDate
      ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'TBD';
    const salaryStr = agreedPrice ? `$${Number(agreedPrice).toLocaleString()}` : 'Not specified';

    // Notify candidate for pipeline contracts.
    if (source === 'pipeline' && pipelineJobTitle) {
      createNotificationHandler.handle(new CreateNotificationCommand({
        userId:  freelancerId,
        type:    'contract_offer',
        title:   'You have a contract offer',
        message: `You received an employment offer for "${pipelineJobTitle}". Salary: ${salaryStr}. Start date: ${startStr}. Go to My Profile → Contracts to review and confirm.`,
        link:    '/my-profile?tab=contracts',
      })).catch(() => {});
    }

    // Notify freelancer for bid/invitation contracts — they must check their Contracts tab to approve.
    if ((source === 'bid' || source === 'invitation') && freelancerId) {
      const jobLabel = freelanceJobTitle ? `"${freelanceJobTitle}"` : 'a job';
      createNotificationHandler.handle(new CreateNotificationCommand({
        userId:  freelancerId,
        type:    'contract_offer',
        title:   'You have a contract offer',
        message: `You received a contract offer for ${jobLabel}. Salary: ${salaryStr}. Start date: ${startStr}. Go to My Profile → Freelance → Contracts to review and accept.`,
        link:    '/my-profile?tab=freelance&sub=contracts',
      })).catch(() => {});
    }

    syncContractSafe(contract.id);
    return contract;
  }
}

module.exports = new CreateContractHandler();
