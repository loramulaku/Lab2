class UploadLogoCommand {
  constructor({ userId, logoPath }) {
    this.userId   = userId;
    this.logoPath = logoPath;
  }
}
module.exports = UploadLogoCommand;
