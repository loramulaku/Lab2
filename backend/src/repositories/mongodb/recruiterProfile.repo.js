const RecruiterProfileView = require('../../models/nosql/RecruiterProfileView');
const createMongoRepo      = require('./_factory');

/**
 * MongoDB READ repository for RecruiterProfileView.
 * _id = MySQL Users.id (userId) — lookup is always by userId.
 */
const recruiterProfileRepo = {
  ...createMongoRepo(RecruiterProfileView),

  async upsert(data) {
    const { id, ...rest } = data;
    return RecruiterProfileView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  },

  async findByUserId(userId) {
    return RecruiterProfileView.findById(Number(userId)).lean();
  },

  async delete(userId) {
    return RecruiterProfileView.findByIdAndDelete(Number(userId));
  },
};

module.exports = recruiterProfileRepo;
