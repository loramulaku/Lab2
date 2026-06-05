'use strict';

const SEED = [
  // Job Type
  { group: 'job_type',         value: 'full-time',  label: 'Full-time',  sortOrder: 1,  isActive: true },
  { group: 'job_type',         value: 'part-time',  label: 'Part-time',  sortOrder: 2,  isActive: true },
  { group: 'job_type',         value: 'internship', label: 'Internship', sortOrder: 3,  isActive: true },
  { group: 'job_type',         value: 'freelance',  label: 'Freelance',  sortOrder: 4,  isActive: true },
  // Work Mode
  { group: 'work_mode',        value: 'remote',     label: 'Remote',     sortOrder: 1,  isActive: true },
  { group: 'work_mode',        value: 'on-site',    label: 'On-site',    sortOrder: 2,  isActive: true },
  { group: 'work_mode',        value: 'hybrid',     label: 'Hybrid',     sortOrder: 3,  isActive: true },
  // Experience Level
  { group: 'experience_level', value: 'junior',     label: 'Junior',     sortOrder: 1,  isActive: true },
  { group: 'experience_level', value: 'mid',        label: 'Mid-level',  sortOrder: 2,  isActive: true },
  { group: 'experience_level', value: 'senior',     label: 'Senior',     sortOrder: 3,  isActive: true },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobFilters', {
      id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      group:     { type: Sequelize.STRING(50),  allowNull: false },
      value:     { type: Sequelize.STRING(50),  allowNull: false },
      label:     { type: Sequelize.STRING(100), allowNull: false },
      sortOrder: { type: Sequelize.INTEGER, defaultValue: 0 },
      isActive:  { type: Sequelize.BOOLEAN, defaultValue: true },
    });

    await queryInterface.bulkInsert('JobFilters', SEED);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.dropTable('JobFilters');
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};
