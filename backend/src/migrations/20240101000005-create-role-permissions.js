'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RolePermissions', {
      id:            { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      role_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Roles', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Permissions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    await queryInterface.addIndex('RolePermissions', ['role_id', 'permission_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('RolePermissions');
  },
};
