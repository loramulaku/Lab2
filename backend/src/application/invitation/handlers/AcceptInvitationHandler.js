const Invitation = require('../../../models/sql/Invitation');
const ContractService = require('../../_shared/ContractService');
const { httpError }   = ContractService;
const { syncInvitationSafe } = require('../../../sync/invitationSync');
const { syncBidSafe }        = require('../../../sync/bidSync');
const { syncJobSafe }        = require('../../../sync/jobSync');
const { syncContractSafe }   = require('../../../sync/contractSync');

/**
 * Freelancer accepts an invitation → creates the Contract (Mode B win).
 * Re-reads the job inside ContractService under a row lock, so an invite
 * accepted after the job was archived/hired is rejected (edge case #1, #5).
 */
class AcceptInvitationHandler {
  async handle(command) {
    const inv = await Invitation.findByPk(command.invitationId);
    if (!inv) throw httpError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
    if (inv.freelancerId !== command.freelancerId) {
      throw httpError(403, 'This invitation is not addressed to you', 'FORBIDDEN');
    }
    if (inv.status !== 'pending') {
      throw httpError(409, `Invitation is already ${inv.status}`, 'INVITATION_NOT_PENDING');
    }
    if (inv.expiresAt && new Date() > inv.expiresAt) {
      await inv.update({ status: 'expired', activeKey: null, updatedAt: new Date() });
      syncInvitationSafe(inv.id);
      throw httpError(409, 'Invitation has expired', 'INVITE_EXPIRED');
    }
    if (!inv.jobId) {
      throw httpError(409, 'Invitation has no associated job', 'JOB_REQUIRED');
    }

    const result = await ContractService.createFromOffer({
      source:           'invite',
      jobId:            inv.jobId,
      freelancerId:     inv.freelancerId,
      companyId:        inv.companyId,
      agreedPrice:      inv.priceOffer,
      deliveryTimeDays: inv.deliveryTimeDays,
      invitationId:     inv.id,
    });

    syncContractSafe(result.contract.id);
    syncJobSafe(inv.jobId);
    syncInvitationSafe(inv.id);
    result.rejectedBidIds.forEach(syncBidSafe);
    result.rejectedInvitationIds.forEach(syncInvitationSafe);

    return result.contract;
  }
}

module.exports = new AcceptInvitationHandler();
