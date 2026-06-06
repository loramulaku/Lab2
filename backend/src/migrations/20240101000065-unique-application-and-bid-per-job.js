'use strict';
module.exports = {
  async up(queryInterface) {
    // One application per (user, job)
    await queryInterface.addIndex('Applications', ['user_id', 'job_id'], {
      unique: true,
      name: 'applications_user_job_unique',
    });
    // One bid per (freelancer, job)
    await queryInterface.addIndex('Bids', ['freelancer_id', 'job_id'], {
      unique: true,
      name: 'bids_freelancer_job_unique',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('Applications', 'applications_user_job_unique');
    await queryInterface.removeIndex('Bids', 'bids_freelancer_job_unique');
  },
};
