const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/mysql');

const Company = sequelize.define('Company', {
  id:          { type: DataTypes.INTEGER,    autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  industry:    { type: DataTypes.STRING(150) },
  location:    { type: DataTypes.STRING(150) },
  size:        { type: DataTypes.STRING(50) },
  foundedYear: { type: DataTypes.SMALLINT,   field: 'founded_year' },
  logoPath:    { type: DataTypes.STRING(500), field: 'logo_path' },
  website:     { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT },
  createdAt:   { type: DataTypes.DATE,       field: 'created_at' },
}, {
  tableName: 'Companies',
  timestamps: false,
});

module.exports = Company;
