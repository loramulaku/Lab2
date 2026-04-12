/**
 * Generic Mongoose paginator.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} filter   - Mongoose filter object
 * @param {object} options
 * @param {number} options.page  - 1-based page number (default 1)
 * @param {number} options.limit - documents per page (default 20)
 * @returns {Promise<{data: object[], total: number, page: number, limit: number, pages: number}>}
 */
async function paginate(Model, filter = {}, { page = 1, limit = 20 } = {}) {
  const skip  = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Model.find(filter).skip(skip).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);

  return {
    data,
    total,
    page:  Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / limit),
  };
}

module.exports = { paginate };
