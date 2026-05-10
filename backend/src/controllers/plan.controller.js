const planViewRepo = require('../repositories/mongodb/planView.repo');

const planController = {
  async getAll(_req, res) {
    const plans = await planViewRepo.findAll();
    return res.json(plans);
  },
};

module.exports = planController;
