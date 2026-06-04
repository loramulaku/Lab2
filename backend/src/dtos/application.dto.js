/**
 * ApplicationDTO — shapes the application response for candidate/recruiter reads.
 * Works against the MongoDB ApplicationView (denormalised).
 */
class ApplicationDTO {
  constructor(data) {
    this.id                = data._id ?? data.id;
    this.jobId             = data.jobId;
    this.userId            = data.userId;
    this.status            = data.status;
    this.appliedAt         = data.appliedAt ?? null;
    this.interviewAt       = data.interviewAt ?? null;
    this.jobTitle          = data.jobTitle ?? null;
    this.jobEmploymentType = data.jobEmploymentType ?? null;
    this.companyName       = data.companyName ?? null;
    this.applicant = {
      firstName: data.applicantFirstName ?? null,
      lastName:  data.applicantLastName ?? null,
      email:     data.applicantEmail ?? null,
    };
  }
  static from(d) { return new ApplicationDTO(d); }
  static fromList(list = []) { return list.map(ApplicationDTO.from); }
}
module.exports = ApplicationDTO;
