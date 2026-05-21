class SetupRecruiterCommand {
  constructor({ userId, companyName, industry, location, size, foundedYear,
                website, description, jobTitle, phone, linkedinUrl }) {
    this.userId      = userId;
    this.companyName = companyName;
    this.industry    = industry    || null;
    this.location    = location    || null;
    this.size        = size        || null;
    this.foundedYear = foundedYear || null;
    this.website     = website     || null;
    this.description = description || null;
    this.jobTitle    = jobTitle    || null;
    this.phone       = phone       || null;
    this.linkedinUrl = linkedinUrl || null;
  }
}
module.exports = SetupRecruiterCommand;
