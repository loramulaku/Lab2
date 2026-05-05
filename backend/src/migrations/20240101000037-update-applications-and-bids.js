'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Applications: cover letter + current stage name
    await queryInterface.addColumn('Applications', 'cover_letter', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('Applications', 'current_stage', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'applied',
    });

    // Bids: created_at timestamp + optional invitation link
    await queryInterface.addColumn('Bids', 'created_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.addColumn('Bids', 'invitation_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Invitations', key: 'id' },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Applications', 'cover_letter');
    await queryInterface.removeColumn('Applications', 'current_stage');
    await queryInterface.removeColumn('Bids', 'created_at');
    await queryInterface.removeColumn('Bids', 'invitation_id');
  },
};
