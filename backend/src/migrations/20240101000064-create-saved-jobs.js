'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_jobs', {
      id:         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      job_id:     { type: Sequelize.INTEGER, allowNull: false, references: { model: 'jobs',  key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('saved_jobs', ['user_id', 'job_id'], { unique: true, name: 'saved_jobs_user_job_unique' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('saved_jobs');
  },
};
