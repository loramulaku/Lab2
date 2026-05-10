const PlanView       = require('../../models/nosql/PlanView');
const createMongoRepo = require('./_factory');

/**
 * MongoDB READ repository for PlanView.
 * Extends the base factory with plan-specific queries.
 * Only query handlers should call this.
 */
const planViewRepo = {
  ...createMongoRepo(PlanView),

  async upsert(data) {
    const { id, ...rest } = data;
    return PlanView.findOneAndUpdate(
      { _id: id },
      { $set: rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  },

  async findAll() {
    return PlanView.find({}).sort({ _id: 1 });
  },

  async findById(planId) {
    return PlanView.findById(Number(planId));
  },

  async delete(planId) {
    return PlanView.findByIdAndDelete(Number(planId));
  },
};

module.exports = planViewRepo;