class UpdateEducationCommand {
  constructor({ userId, educationId, degree, institution, startYear, endYear }) {
    this.userId      = userId;
    this.educationId = educationId;
    this.degree      = degree;
    this.institution = institution;
    this.startYear   = Number(startYear);
    this.endYear     = endYear ? Number(endYear) : null;
  }
}
module.exports = UpdateEducationCommand;
