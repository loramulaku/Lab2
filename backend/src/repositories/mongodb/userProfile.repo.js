const UserProfile    = require('../../models/nosql/UserProfile');
const createMongoRepo = require('./_factory');

/**
 * MongoDB READ repository for UserProfile.
 * Only query handlers should call this.
 */
const userProfileRepo = {
  ...createMongoRepo(UserProfile),

  async upsert(data) {
    const { id, ...rest } = data;
    return UserProfile.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  async findByUserId(userId) {
    return UserProfile.findById(Number(userId)).lean();
  },

  async delete(userId) {
    return UserProfile.findByIdAndDelete(Number(userId));
  },
};

module.exports = userProfileRepo;
