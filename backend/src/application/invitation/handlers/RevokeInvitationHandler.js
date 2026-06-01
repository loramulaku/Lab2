const Invitation = require('../../../models/sql/Invitation');
const { httpError }          = require('../../_shared/ContractService');
const { syncInvitationSafe } = require('../../../sync/invitationSync');

class RevokeInvitationHandler {
  async handle(command) {
    const inv = await Invitation.findByPk(command.invitationId);
    if (!inv) throw httpError(404, 'Invitation not found', 'INVITATION_NOT_FOUND');
    if (inv.companyId !== command.companyId) {
      throw httpError(403, 'You do not own this invitation', 'FORBIDDEN');
    }
    if (inv.status !== 'pending') {
      throw httpError(409, `Invitation is already ${inv.status}`, 'INVITATION_NOT_PENDING');
    }

    await inv.update({ status: 'revoked', activeKey: null, updatedAt: new Date() });
    syncInvitationSafe(inv.id);
    return inv;
  }
}

module.exports = new RevokeInvitationHandler();
