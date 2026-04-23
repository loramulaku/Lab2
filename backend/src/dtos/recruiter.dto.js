/**
 * RecruiterProfileDTO — shapes the recruiter profile API response.
 * Works whether the source is MongoDB (RecruiterProfileView) or a
 * MySQL fallback object — both have the same field names.
 */
class RecruiterProfileDTO {
  constructor(data) {
    this.id          = data._id  ?? data.id;
    this.firstName   = data.firstName;
    this.lastName    = data.lastName;
    this.email       = data.email;
    this.avatarPath  = data.avatarPath  ?? null;
    this.jobTitle    = data.jobTitle    ?? null;
    this.phone       = data.phone       ?? null;
    this.linkedinUrl = data.linkedinUrl ?? null;
    this.company     = data.company     ?? null;
  }

  static from(data) { return new RecruiterProfileDTO(data); }
}

module.exports = RecruiterProfileDTO;
