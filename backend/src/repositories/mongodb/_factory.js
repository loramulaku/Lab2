/**
 * MongoDB repository factory.
 *
 * Every read-model collection needs the same four operations.
 * Pass the Mongoose model and get back a repo object with:
 *   upsert(data)          – insert or update by _id (MySQL id)
 *   findById(id)          – fetch single document
 *   findAll(filter, opts) – paginated list
 *   delete(id)            – remove document
 *
 * Repos with extra query methods (e.g. jobView.repo) import this
 * factory and spread its result, then add the extra methods.
 */

const { paginate } = require('../../utils/pagination');

function createMongoRepo(Model) {
  return {
    /**
     * @param {object} data  – must include `id` (the MySQL PK)
     */
    async upsert(data) {
      const { id, ...rest } = data;
      return Model.findOneAndUpdate(
        { _id: id },
        { $set: rest },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    },

    async findById(id) {
      return Model.findById(id).lean();
    },

    /**
     * @param {object} filter   – Mongoose filter object
     * @param {object} opts
     * @param {number} opts.page  – 1-based page (default 1)
     * @param {number} opts.limit – docs per page (default 20)
     */
    async findAll(filter = {}, opts = {}) {
      return paginate(Model, filter, opts);
    },

    async delete(id) {
      return Model.findByIdAndDelete(id);
    },
  };
}

module.exports = createMongoRepo;
