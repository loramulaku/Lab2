'use strict';

/**
 * Richer freelancer bid: fixed-vs-hourly offer, weekly availability, start date,
 * optional milestones (phase → price → deadline), portfolio links, and a skills
 * snapshot — all so the recruiter can compare bids meaningfully.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Bids', 'bid_type',        { type: Sequelize.ENUM('fixed', 'hourly'), allowNull: false, defaultValue: 'fixed' });
    await queryInterface.addColumn('Bids', 'hours_per_week',  { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('Bids', 'start_date',      { type: Sequelize.DATEONLY, allowNull: true });
    await queryInterface.addColumn('Bids', 'milestones',      { type: Sequelize.JSON, allowNull: true });
    await queryInterface.addColumn('Bids', 'portfolio_links', { type: Sequelize.JSON, allowNull: true });
    await queryInterface.addColumn('Bids', 'skills_snapshot', { type: Sequelize.JSON, allowNull: true });
  },

  async down(queryInterface) {
    for (const col of ['bid_type', 'hours_per_week', 'start_date', 'milestones', 'portfolio_links', 'skills_snapshot']) {
      await queryInterface.removeColumn('Bids', col);
    }
  },
};
