const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Skill = sequelize.define('Skill', {
  id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), unique: true },
}, {
  tableName: 'Skills',
  timestamps: false,
});

module.exports = Skill;
