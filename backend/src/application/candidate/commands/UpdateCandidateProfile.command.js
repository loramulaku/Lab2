/**
 * Only fields that are explicitly provided are applied (undefined = leave as-is),
 * so this command doubles as the "save-back from the application form" path
 * without nulling out fields the form didn't touch. `cvPath` is set via the
 * dedicated CV upload route, not here.
 */
class UpdateCandidateProfileCommand {
  constructor(data = {}) {
    this.userId            = data.userId;
    this.firstName         = data.firstName;
    this.lastName          = data.lastName;
    this.headline          = data.headline;
    this.bio               = data.bio;
    this.location          = data.location;
    this.phone             = data.phone;
    this.linkedinUrl       = data.linkedinUrl;
    this.githubUrl         = data.githubUrl;
    this.portfolioUrl      = data.portfolioUrl;
    this.willingToRelocate = data.willingToRelocate;
    this.yearsExperience   = data.yearsExperience;
  }
}
module.exports = UpdateCandidateProfileCommand;
