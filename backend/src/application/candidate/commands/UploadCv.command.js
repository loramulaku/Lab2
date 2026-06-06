class UploadCvCommand {
  constructor({ userId, cvPath }) {
    this.userId = userId;
    this.cvPath = cvPath;
  }
}
module.exports = UploadCvCommand;
