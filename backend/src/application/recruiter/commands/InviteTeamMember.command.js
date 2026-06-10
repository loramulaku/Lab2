class InviteTeamMemberCommand {
  constructor({ companyId, email, jobTitle }) {
    this.companyId = companyId;
    this.email     = email?.trim().toLowerCase();
    this.jobTitle  = jobTitle?.trim() || null;
  }
}
module.exports = InviteTeamMemberCommand;
