const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const CandidateSkill = sequelize.define('CandidateSkill', {
  id:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:  { type: DataTypes.INTEGER, field: 'user_id' },
  skillId: { type: DataTypes.INTEGER, field: 'skill_id' },
  level:   { type: DataTypes.STRING(50) },
}, {
  tableName: 'CandidateSkills',
  timestamps: false,
  indexes: [{ unique: true, fields: ['user_id', 'skill_id'] }],
});

module.exports = CandidateSkill;
