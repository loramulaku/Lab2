const CandidateProfile             = require('../../../models/sql/CandidateProfile');
const { syncCandidate, syncCandidateSafe } = require('../../../sync/candidateSync');

/**
 * WRITE path — toggles a candidate's freelance mode in MySQL, then projects
 * the change to the MongoDB CandidateProfileView (so recruiter freelancer
 * search and the candidate's profile read reflect it).
 *
 * upsert keeps it safe even if the candidate has no profile row yet — the
 * GetCandidateProfileHandler creates the view lazily, and registration always
 * creates the User; this guarantees a CandidateProfiles row exists.
 */
class SetFreelanceModeHandler {
  async handle(command) {
    const active = !!command.active;
    await CandidateProfile.upsert({ userId: command.userId, freelanceActive: active });
    // Await the projection so an immediate profile/search read reflects the
    // toggle (the read side only self-heals on a cache miss, and the view
    // usually already exists). Fall back to safe-logged retry on failure.
    try { await syncCandidate(command.userId); }
    catch { syncCandidateSafe(command.userId); }
    return { message: active ? 'Freelance mode activated' : 'Freelance mode deactivated', freelanceActive: active };
  }
}

module.exports = new SetFreelanceModeHandler();
