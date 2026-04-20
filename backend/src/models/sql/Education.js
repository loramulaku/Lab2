const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Education = sequelize.define('Education', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  degree:      { type: DataTypes.STRING(255), allowNull: false },
  institution: { type: DataTypes.STRING(255), allowNull: false },
  startYear:   { type: DataTypes.SMALLINT, allowNull: false, field: 'start_year' },
  endYear:     { type: DataTypes.SMALLINT, allowNull: true, field: 'end_year' },
}, {
  tableName: 'Educations',
  timestamps: false,
});

module.exports = Education;
