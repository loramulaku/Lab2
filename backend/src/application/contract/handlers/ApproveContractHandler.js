const { Op }      = require('sequelize');
const { sequelize } = require('../../../config/mysql');
const Contract    = require('../../../models/sql/Contract');
const Bid         = require('../../../models/sql/Bid');
const Invitation  = require('../../../models/sql/Invitation');
const Application = require('../../../models/sql/Application');
const Job         = require('../../../models/sql/Job');
const { httpError } = require('../../_shared/ContractService');
const { syncContractSafe }   = require('../../../sync/contractSync');
const { syncBidSafe }        = require('../../../sync/bidSync');
const { syncJobSafe }        = require('../../../sync/jobSync');
const { syncInvitationSafe } = require('../../../sync/invitationSync');
const { syncApplicationSafe } = require('../../../sync/applicationSync');

/**
 * Freelancer or candidate approves a pending contract.
 *
 * The caller must be:
 *   - contract.freelancerId (for bid / invitation / pipeline sources)
 *
 * On approval:
 *   bid source        → bid accepted, job closed, other bids/invitations on that job rejected
 *   invitation source → invitation accepted, job closed (if any), others rejected
 *   pipeline source   → application.status = 'hired' (job is NOT auto-closed for standard hiring)
 */
class ApproveContractHandler {
  async handle(command) {
    const contract = await Contract.findByPk(command.contractId);
    if (!contract) throw httpError(404, 'Contract not found', 'CONTRACT_NOT_FOUND');
    if (contract.status !== 'pending') {
      throw httpError(409, `Contract is already ${contract.status}`, 'CONTRACT_NOT_PENDING');
    }
    if (contract.freelancerId !== command.userId) {
      throw httpError(403, 'You are not a party to this contract', 'FORBIDDEN');
    }

    return sequelize.transaction(async (t) => {
      // 1. Activate the contract (set activeKey for freelance to guard one-per-job).
      const isFreelance = contract.source === 'bid' || contract.source === 'invitation';
      const activeKey   = isFreelance ? `job:${contract.jobId}` : null;

      try {
        await contract.update({
          status: 'active',
          activeKey,
          approvedAt: new Date(),
        }, { transaction: t });
      } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
          throw httpError(409, 'This job already has an active contract', 'ALREADY_HIRED');
        }
        throw err;
      }

      // 2. Source-specific post-approval actions.
      if (contract.source === 'bid' && contract.bidId) {
        // Mark winning bid accepted.
        await Bid.update(
          { status: 'accepted', updatedAt: new Date() },
          { where: { id: contract.bidId }, transaction: t },
        );
        // Close the job.
        const job = await Job.findByPk(contract.jobId, { transaction: t });
        if (job) await job.update({ status: 'closed', closedAt: new Date() }, { transaction: t });
        // Reject all other pending bids and invitations on this job.
        const rejectedBids = await Bid.findAll({
          where: { jobId: contract.jobId, status: 'pending', id: { [Op.ne]: contract.bidId } },
          attributes: ['id'], transaction: t,
        });
        const rejectedInvites = await Invitation.findAll({
          where: { jobId: contract.jobId, status: 'pending' },
          attributes: ['id'], transaction: t,
        });
        await Bid.update(
          { status: 'rejected', updatedAt: new Date() },
          { where: { jobId: contract.jobId, status: 'pending', id: { [Op.ne]: contract.bidId } }, transaction: t },
        );
        await Invitation.update(
          { status: 'rejected', activeKey: null, respondedAt: new Date(), updatedAt: new Date() },
          { where: { jobId: contract.jobId, status: 'pending' }, transaction: t },
        );
        syncJobSafe(contract.jobId);
        rejectedBids.forEach(b => syncBidSafe(b.id));
        rejectedInvites.forEach(i => syncInvitationSafe(i.id));
        syncBidSafe(contract.bidId);
      }

      if (contract.source === 'invitation' && contract.invitationId) {
        // Mark winning invitation accepted.
        await Invitation.update(
          { status: 'accepted', activeKey: null, respondedAt: new Date(), updatedAt: new Date() },
          { where: { id: contract.invitationId }, transaction: t },
        );
        if (contract.jobId) {
          const job = await Job.findByPk(contract.jobId, { transaction: t });
          if (job) await job.update({ status: 'closed', closedAt: new Date() }, { transaction: t });
          // Reject other pending bids and invitations.
          const rejectedBids = await Bid.findAll({
            where: { jobId: contract.jobId, status: 'pending' },
            attributes: ['id'], transaction: t,
          });
          const rejectedInvites = await Invitation.findAll({
            where: { jobId: contract.jobId, status: 'pending', id: { [Op.ne]: contract.invitationId } },
            attributes: ['id'], transaction: t,
          });
          await Bid.update(
            { status: 'rejected', updatedAt: new Date() },
            { where: { jobId: contract.jobId, status: 'pending' }, transaction: t },
          );
          await Invitation.update(
            { status: 'rejected', activeKey: null, respondedAt: new Date(), updatedAt: new Date() },
            { where: { jobId: contract.jobId, status: 'pending', id: { [Op.ne]: contract.invitationId } }, transaction: t },
          );
          syncJobSafe(contract.jobId);
          rejectedBids.forEach(b => syncBidSafe(b.id));
          rejectedInvites.forEach(i => syncInvitationSafe(i.id));
        }
        syncInvitationSafe(contract.invitationId);
      }

      if (contract.source === 'pipeline' && contract.applicationId) {
        await Application.update(
          { status: 'hired' },
          { where: { id: contract.applicationId }, transaction: t },
        );
        syncApplicationSafe(contract.applicationId);
      }

      syncContractSafe(contract.id);
      return contract;
    });
  }
}

module.exports = new ApproveContractHandler();
