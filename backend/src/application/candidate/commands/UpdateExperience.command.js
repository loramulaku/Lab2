class UpdateExperienceCommand {
  constructor({ userId, experienceId, title, company, startDate, endDate, description }) {
    this.userId       = userId;
    this.experienceId = experienceId;
    this.title        = title;
    this.company      = company;
    this.startDate    = startDate;
    this.endDate      = endDate     || null;
    this.description  = description || null;
  }
}
module.exports = UpdateExperienceCommand;
