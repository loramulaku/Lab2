const userProfileRepo              = require('../../../repositories/mongodb/userProfile.repo');
const { syncUser, syncUserSafe }   = require('../../../sync/userSync');

/**
 * READ path — UserProfileView (MongoDB) first.
 * On cache miss, syncs synchronously so the first request always returns data.
 */
class GetUserProfileHandler {
  async handle(query) {
    const doc = await userProfileRepo.findByUserId(query.userId);
    if (doc) return doc;

    try {
      await syncUser(query.userId);
    } catch (err) {
      syncUserSafe(query.userId);
      return null;
    }
    return userProfileRepo.findByUserId(query.userId);
  }
}

module.exports = new GetUserProfileHandler();
