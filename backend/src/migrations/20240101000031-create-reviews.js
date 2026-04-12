'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      reviewer_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reviewed_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      rating:      { type: Sequelize.INTEGER },
      comment:     { type: Sequelize.TEXT },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Reviews');
  },
};
