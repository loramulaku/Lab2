class ApplyToJobCommand {
  constructor(data = {}) {
    this.userId            = data.userId;
    this.jobId             = Number(data.jobId);
    // submitted application form
    this.coverLetter       = data.coverLetter       ?? null;
    this.expectedSalary    = data.expectedSalary    ?? null;
    this.availableFrom     = data.availableFrom      || null;
    this.cvPath            = data.cvPath             ?? null;   // optional; falls back to profile CV
    this.phone             = data.phone             ?? null;
    this.willingToRelocate = data.willingToRelocate ?? null;
    this.yearsExperience   = data.yearsExperience   ?? null;
    this.screeningAnswers  = data.screeningAnswers  ?? null;
    this.skillsSnapshot    = data.skillsSnapshot    ?? null;
    // reusable contact/links — saved back to the profile so they prefill next time
    this.location          = data.location          ?? null;
    this.linkedinUrl       = data.linkedinUrl       ?? null;
    this.githubUrl         = data.githubUrl         ?? null;
    this.portfolioUrl      = data.portfolioUrl      ?? null;
  }
}
module.exports = ApplyToJobCommand;
