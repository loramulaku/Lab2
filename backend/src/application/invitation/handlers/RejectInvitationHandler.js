const Invitation = require('../../../models/sql/Invitation');
const { httpError }          = require('../../_shared/ContractService');
const { syncInvitationSafe } = require('../../../sync/invitationSync');

class RejectInvitationHandler {
  async handle(command) {
    const inv = await Invitation.findByPk(command.invitationId);
    if (!inv) throw httpError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
    if (inv.freelancerId !== command.freelancerId) {
      throw httpError(403, 'This invitation is not addressed to you', 'FORBIDDEN');
    }
    if (inv.status !== 'pending') {
      throw httpError(409, `Invitation is already ${inv.status}`, 'INVITATION_NOT_PENDING');
    }

    await inv.update({ status: 'rejected', activeKey: null, respondedAt: new Date(), updatedAt: new Date() });
    syncInvitationSafe(inv.id);
    return inv;
  }
}

module.exports = new RejectInvitationHandler();
