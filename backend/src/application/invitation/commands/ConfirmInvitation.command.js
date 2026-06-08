class ConfirmInvitationCommand {
  constructor({ invitationId, freelancerId }) {
    this.invitationId = Number(invitationId);
    this.freelancerId = Number(freelancerId);
  }
}

module.exports = ConfirmInvitationCommand;
