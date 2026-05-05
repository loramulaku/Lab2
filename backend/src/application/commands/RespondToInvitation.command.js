class RespondToInvitationCommand {
  constructor({ invitationId, userId, response }) {
    this.invitationId = invitationId;
    this.userId       = userId;
    this.response     = response; // 'accepted' | 'rejected'
  }
}

module.exports = RespondToInvitationCommand;
