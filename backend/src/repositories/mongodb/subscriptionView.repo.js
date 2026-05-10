const SubscriptionView = require('../../models/nosql/SubscriptionView');
const createMongoRepo  = require('./_factory');

/**
 * MongoDB READ repository for SubscriptionView.
 * Extends the base factory with subscription-specific queries.
 * Only query handlers should call this.
 */
const subscriptionViewRepo = {
  ...createMongoRepo(SubscriptionView),

  async upsert(data) {
    const { id, ...rest } = data;
    return SubscriptionView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  async findActiveByCompany(companyId) {
    return SubscriptionView.findOne({ companyId: Number(companyId), status: 'active' });
  },

  async findByCompany(companyId) {
    return SubscriptionView.find({ companyId: Number(companyId) }).sort({ _id: -1 });
  },

  async delete(subscriptionId) {
    return SubscriptionView.findByIdAndDelete(Number(subscriptionId));
  },
};

module.exports = subscriptionViewRepo;