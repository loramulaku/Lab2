'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Companies — add industry, location, size, founded_year, logo_path
    await queryInterface.addColumn('Companies', 'industry',     { type: Sequelize.STRING(150), allowNull: true, after: 'name' });
    await queryInterface.addColumn('Companies', 'location',     { type: Sequelize.STRING(150), allowNull: true, after: 'industry' });
    await queryInterface.addColumn('Companies', 'size',         { type: Sequelize.STRING(50),  allowNull: true, after: 'location' });
    await queryInterface.addColumn('Companies', 'founded_year', { type: Sequelize.SMALLINT,    allowNull: true, after: 'size' });
    await queryInterface.addColumn('Companies', 'logo_path',    { type: Sequelize.STRING(500), allowNull: true, after: 'founded_year' });

    // RecruiterProfiles — add job_title, phone, linkedin_url
    await queryInterface.addColumn('RecruiterProfiles', 'job_title',    { type: Sequelize.STRING(150), allowNull: true });
    await queryInterface.addColumn('RecruiterProfiles', 'phone',        { type: Sequelize.STRING(50),  allowNull: true });
    await queryInterface.addColumn('RecruiterProfiles', 'linkedin_url', { type: Sequelize.STRING(500), allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Companies', 'industry');
    await queryInterface.removeColumn('Companies', 'location');
    await queryInterface.removeColumn('Companies', 'size');
    await queryInterface.removeColumn('Companies', 'founded_year');
    await queryInterface.removeColumn('Companies', 'logo_path');
    await queryInterface.removeColumn('RecruiterProfiles', 'job_title');
    await queryInterface.removeColumn('RecruiterProfiles', 'phone');
    await queryInterface.removeColumn('RecruiterProfiles', 'linkedin_url');
  },
};
