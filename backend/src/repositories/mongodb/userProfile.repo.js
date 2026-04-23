const UserProfileView  = require('../../models/nosql/UserProfileView');
const createMongoRepo  = require('./_factory');

/**
 * MongoDB READ repository for UserProfileView.
 * Only query handlers and admin lookups should call this.
 * Candidate-specific reads use candidateProfile.repo.
 * Recruiter-specific reads use recruiterProfile.repo.
 */
const userProfileRepo = {
  ...createMongoRepo(UserProfileView),

  async upsert(data) {
    const { id, ...rest } = data;
    return UserProfileView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  },

  async findByUserId(userId) {
    return UserProfileView.findById(Number(userId)).lean();
  },

  async delete(userId) {
    return UserProfileView.findByIdAndDelete(Number(userId));
  },
};

module.exports = userProfileRepo;
