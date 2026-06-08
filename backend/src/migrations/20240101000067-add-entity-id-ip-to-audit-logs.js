'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('AuditLogs', 'entity_id', {
      type:         Sequelize.INTEGER,
      allowNull:    true,
      defaultValue: null,
      after:        'entity',
    });
    await queryInterface.addColumn('AuditLogs', 'ip_address', {
      type:         Sequelize.STRING(45),
      allowNull:    true,
      defaultValue: null,
      after:        'new_value',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('AuditLogs', 'entity_id');
    await queryInterface.removeColumn('AuditLogs', 'ip_address');
  },
};
