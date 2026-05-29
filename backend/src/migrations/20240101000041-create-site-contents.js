'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SiteContents', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      key:        { type: Sequelize.STRING(120), allowNull: false, unique: true },
      value:      { type: Sequelize.TEXT, allowNull: false },
      label:      { type: Sequelize.STRING(160), allowNull: true },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('SiteContents', ['key'], { unique: true, name: 'site_contents_key_unique' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('SiteContents');
  },
};
