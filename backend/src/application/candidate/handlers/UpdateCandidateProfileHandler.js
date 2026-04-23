const User                  = require('../../../models/sql/User');
const CandidateProfile      = require('../../../models/sql/CandidateProfile');
const { syncCandidateSafe } = require('../../../sync/candidateSync');
const { syncUserSafe }      = require('../../../sync/userSync');

class UpdateCandidateProfileHandler {
  async handle(command) {
    const { userId, firstName, lastName, headline, bio, location } = command;
    await User.update({ firstName, lastName }, { where: { id: userId } });
    await CandidateProfile.upsert({ userId, headline, bio, location });
    // Sync both views: CandidateProfileView (full profile) and UserProfileView
    // (firstName/lastName live in both — keep them consistent).
    syncCandidateSafe(userId);
    syncUserSafe(userId);
    return { message: 'Profile updated' };
  }
}

module.exports = new UpdateCandidateProfileHandler();
