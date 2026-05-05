class ApplicationDTO {
  constructor(a) {
    this.id                 = a.id ?? a._id;
    this.jobId              = a.jobId;
    this.userId             = a.userId;
    this.currentStage       = a.currentStage ?? 'applied';
    this.status             = a.status;
    this.coverLetter        = a.coverLetter ?? null;
    this.appliedAt          = a.appliedAt;
    this.jobTitle           = a.jobTitle           ?? null;
    this.companyName        = a.companyName         ?? null;
    this.applicantFirstName = a.applicantFirstName  ?? null;
    this.applicantLastName  = a.applicantLastName   ?? null;
    this.applicantEmail     = a.applicantEmail      ?? null;
  }

  static from(a)      { return new ApplicationDTO(a); }
  static fromList(as) { return as.map(ApplicationDTO.from); }
}

module.exports = ApplicationDTO;
