const Plan = require('../models/sql/Plan');

const planController = {
  async getAll(_req, res) {
    const plans = await Plan.findAll();
    return res.json(plans);
  },
};

module.exports = planController;
