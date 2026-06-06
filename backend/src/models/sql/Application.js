const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Application = sequelize.define('Application', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jobId:     { type: DataTypes.INTEGER, field: 'job_id' },
  userId:    { type: DataTypes.INTEGER, field: 'user_id' },
  stageId:   { type: DataTypes.INTEGER, field: 'stage_id' },
  status:    { type: DataTypes.STRING(50) },
  appliedAt: { type: DataTypes.DATE, field: 'applied_at' },
  interviewAt: { type: DataTypes.DATE, field: 'interview_at', allowNull: true },
  // ── submitted application form ──
  coverLetter:       { type: DataTypes.TEXT, field: 'cover_letter' },
  expectedSalary:    { type: DataTypes.DECIMAL(10, 2), field: 'expected_salary' },
  availableFrom:     { type: DataTypes.DATEONLY, field: 'available_from' },
  cvPath:            { type: DataTypes.STRING(500), field: 'cv_path' },
  phone:             { type: DataTypes.STRING(50), field: 'phone' },
  willingToRelocate: { type: DataTypes.BOOLEAN, field: 'willing_to_relocate' },
  yearsExperience:   { type: DataTypes.INTEGER, field: 'years_experience' },
  screeningAnswers:  { type: DataTypes.JSON, field: 'screening_answers' },
  skillsSnapshot:    { type: DataTypes.JSON, field: 'skills_snapshot' },
}, {
  tableName: 'Applications',
  timestamps: false,
  indexes: [{ unique: true, fields: ['user_id', 'job_id'], name: 'applications_user_job_unique' }],
});

module.exports = Application;
