'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'avatar_path', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
      after: 'is_active',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'avatar_path');
  },
};
