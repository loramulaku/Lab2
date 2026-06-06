const User                  = require('../../../models/sql/User');
const CandidateProfile      = require('../../../models/sql/CandidateProfile');
const { syncCandidateSafe } = require('../../../sync/candidateSync');
const { syncUserSafe }      = require('../../../sync/userSync');

class UpdateCandidateProfileHandler {
  async handle(command) {
    const { userId, firstName, lastName, ...rest } = command;

    // Update User name only if provided.
    const nameUpdate = {};
    if (firstName !== undefined) nameUpdate.firstName = firstName;
    if (lastName  !== undefined) nameUpdate.lastName  = lastName;
    if (Object.keys(nameUpdate).length) await User.update(nameUpdate, { where: { id: userId } });

    // Upsert only the profile fields that were actually provided, so a partial
    // save (e.g. persist-back from the application form) never nulls out the rest.
    const profileFields = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) profileFields[k] = v;
    }
    await CandidateProfile.upsert({ userId, ...profileFields });

    // Sync both views: CandidateProfileView (full profile) and UserProfileView
    // (firstName/lastName live in both — keep them consistent).
    syncCandidateSafe(userId);
    syncUserSafe(userId);
    return { message: 'Profile updated' };
  }
}

module.exports = new UpdateCandidateProfileHandler();
