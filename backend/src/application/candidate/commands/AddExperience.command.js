class AddExperienceCommand {
  constructor({ userId, title, company, startDate, endDate, description }) {
    this.userId      = userId;
    this.title       = title;
    this.company     = company;
    this.startDate   = startDate;
    this.endDate     = endDate     || null;
    this.description = description || null;
  }
}
module.exports = AddExperienceCommand;
