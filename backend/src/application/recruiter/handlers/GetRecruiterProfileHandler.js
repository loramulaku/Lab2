const recruiterProfileRepo                   = require('../../../repositories/mongodb/recruiterProfile.repo');
const { syncRecruiter, syncRecruiterSafe }   = require('../../../sync/recruiterSync');

class GetRecruiterProfileHandler {
  async handle(query) {
    const doc = await recruiterProfileRepo.findByUserId(query.userId);
    if (doc) return doc;

    try {
      await syncRecruiter(query.userId);
    } catch (err) {
      syncRecruiterSafe(query.userId);
      return null;
    }
    return recruiterProfileRepo.findByUserId(query.userId);
  }
}

module.exports = new GetRecruiterProfileHandler();
