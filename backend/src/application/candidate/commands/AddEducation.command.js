class AddEducationCommand {
  constructor({ userId, degree, institution, startYear, endYear }) {
    this.userId      = userId;
    this.degree      = degree;
    this.institution = institution;
    this.startYear   = Number(startYear);
    this.endYear     = endYear ? Number(endYear) : null;
  }
}
module.exports = AddEducationCommand;
