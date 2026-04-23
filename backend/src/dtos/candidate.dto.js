/**
 * CandidateProfileDTO — shapes the candidate profile API response.
 * Works whether the source is MongoDB (CandidateProfileView) or a
 * MySQL fallback object — both have the same field names.
 */
class CandidateProfileDTO {
  constructor(data) {
    this.id          = data._id  ?? data.id;
    this.firstName   = data.firstName;
    this.lastName    = data.lastName;
    this.email       = data.email;
    this.avatarPath  = data.avatarPath  ?? null;
    this.headline    = data.headline    ?? null;
    this.bio         = data.bio         ?? null;
    this.location    = data.location    ?? null;
    this.skills      = data.skills      ?? [];
    this.experiences = data.experiences ?? [];
    this.educations  = data.educations  ?? [];
    this.stats       = data.stats ?? {
      totalApplications: 0,
      skillsListed:      0,
      workExperiences:   0,
      educationRecords:  0,
    };
    this.createdAt   = data.createdAt   ?? null;
  }

  static from(data) { return new CandidateProfileDTO(data); }
}

module.exports = CandidateProfileDTO;
