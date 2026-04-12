/**
 * MySQL repository factory.
 *
 * Every write-model needs the same four operations.
 * Pass the Sequelize model and get back a repo object with:
 *   create(data)       – INSERT row
 *   update(id, data)   – UPDATE by PK
 *   findById(id)       – SELECT by PK
 *   delete(id)         – DELETE by PK
 *
 * Repos with extra logic (e.g. job.repo — handles bulk JobSkills)
 * import this factory, spread its result, and override as needed.
 */

function createMysqlRepo(Model) {
  return {
    async create(data) {
      return Model.create(data);
    },

    async update(id, data) {
      await Model.update(data, { where: { id } });
      return Model.findByPk(id);
    },

    async findById(id) {
      return Model.findByPk(id);
    },

    async delete(id) {
      return Model.destroy({ where: { id } });
    },
  };
}

module.exports = createMysqlRepo;
