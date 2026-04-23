class UploadAvatarCommand {
  constructor({ userId, avatarPath, roles }) {
    this.userId     = userId;
    this.avatarPath = avatarPath;
    this.roles      = roles;
  }
}
module.exports = UploadAvatarCommand;
