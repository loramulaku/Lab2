const CandidateProfileView = require('../../models/nosql/CandidateProfileView');
const createMongoRepo      = require('./_factory');

/**
 * MongoDB READ repository for CandidateProfileView.
 * _id = MySQL Users.id (userId) — lookup is always by userId.
 */
const candidateProfileRepo = {
  ...createMongoRepo(CandidateProfileView),

  async upsert(data) {
    const { id, ...rest } = data;
    return CandidateProfileView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  },

  async findByUserId(userId) {
    return CandidateProfileView.findById(Number(userId)).lean();
  },

  async delete(userId) {
    return CandidateProfileView.findByIdAndDelete(Number(userId));
  },
};

module.exports = candidateProfileRepo;
