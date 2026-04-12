'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('JobCategories', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      job_id:      {
        type: Sequelize.INTEGER,
        references: { model: 'Jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('JobCategories', ['job_id', 'category_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('JobCategories');
  },
};
