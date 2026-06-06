const CandidateProfile      = require('../../../models/sql/CandidateProfile');
const { syncCandidateSafe } = require('../../../sync/candidateSync');

/**
 * Stores the uploaded CV path on the candidate's profile so it is reused
 * (prefilled) on every future application — the candidate uploads once.
 */
class UploadCvHandler {
  async handle(command) {
    await CandidateProfile.upsert({ userId: command.userId, cvPath: command.cvPath });
    syncCandidateSafe(command.userId);
    return { cvPath: command.cvPath };
  }
}

module.exports = new UploadCvHandler();
