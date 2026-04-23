const User                  = require('../../../models/sql/User');
const { syncCandidateSafe } = require('../../../sync/candidateSync');
const { syncRecruiterSafe } = require('../../../sync/recruiterSync');
const { syncUserSafe }      = require('../../../sync/userSync');

class UploadAvatarHandler {
  async handle(command) {
    const { userId, avatarPath, roles } = command;
    await User.update({ avatarPath }, { where: { id: userId } });

    // avatarPath lives in UserProfileView, CandidateProfileView, and RecruiterProfileView.
    // Always sync all three views that are relevant for this user.
    syncUserSafe(userId);
    if (roles.includes('candidate'))       syncCandidateSafe(userId);
    else if (roles.includes('recruiter'))  syncRecruiterSafe(userId);

    return { path: avatarPath };
  }
}

module.exports = new UploadAvatarHandler();
