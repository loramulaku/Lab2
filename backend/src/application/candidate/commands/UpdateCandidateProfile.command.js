class UpdateCandidateProfileCommand {
  constructor({ userId, firstName, lastName, headline, bio, location }) {
    this.userId    = userId;
    this.firstName = firstName;
    this.lastName  = lastName;
    this.headline  = headline;
    this.bio       = bio;
    this.location  = location;
  }
}
module.exports = UpdateCandidateProfileCommand;
