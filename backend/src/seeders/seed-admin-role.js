const { sequelize } = require('../config/mysql');

async function seedAdminRole() {
  try {
    const [roles] = await sequelize.query('SELECT * FROM Roles WHERE name = "admin"');
    
    if (roles.length === 0) {
      await sequelize.query('INSERT INTO Roles (name) VALUES ("admin")');
      console.log('✅ Admin role created successfully');
    } else {
      console.log('ℹ️  Admin role already exists');
    }

    const [candidateRole] = await sequelize.query('SELECT * FROM Roles WHERE name = "candidate"');
    if (candidateRole.length === 0) {
      await sequelize.query('INSERT INTO Roles (name) VALUES ("candidate")');
      console.log('✅ Candidate role created successfully');
    }

    const [recruiterRole] = await sequelize.query('SELECT * FROM Roles WHERE name = "recruiter"');
    if (recruiterRole.length === 0) {
      await sequelize.query('INSERT INTO Roles (name) VALUES ("recruiter")');
      console.log('✅ Recruiter role created successfully');
    }

  } catch (error) {
    console.error('❌ Error seeding roles:', error.message);
    throw error;
  }
}

if (require.main === module) {
  seedAdminRole()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedAdminRole;
