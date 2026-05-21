const candidateProfileRepo           = require('../../../repositories/mongodb/candidateProfile.repo');
const { syncCandidate, syncCandidateSafe } = require('../../../sync/candidateSync');

/**
 * READ path — MongoDB first.
 * On a cache miss (e.g. the fire-and-forget sync from registration hasn't
 * landed yet), run a synchronous sync so the very first request always
 * returns data instead of 404.
 */
class GetCandidateProfileHandler {
  async handle(query) {
    const doc = await candidateProfileRepo.findByUserId(query.userId);
    if (doc) return doc;

    // Cache miss — populate MongoDB now, then return the freshly written doc.
    // Falls back to null only if the user doesn't exist in MySQL either.
    try {
      await syncCandidate(query.userId);
    } catch (err) {
      syncCandidateSafe(query.userId); // log to FailedSyncs if it blew up
      return null;
    }
    return candidateProfileRepo.findByUserId(query.userId);
  }
}

module.exports = new GetCandidateProfileHandler();
