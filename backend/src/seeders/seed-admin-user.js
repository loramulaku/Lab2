const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/mysql');

async function seedAdminUser() {
  try {
    console.log('🔄 Creating default admin user...');

    // Check if admin user already exists
    const [existingUsers] = await sequelize.query(
      'SELECT id, email FROM Users WHERE email = "admin@hireflow.com"'
    );

    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log('ℹ️  Admin user already exists (ID:', userId, ')');
    } else {
      // Create admin user
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const [result] = await sequelize.query(
        `INSERT INTO Users (first_name, last_name, email, password_hash, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: ['Admin', 'User', 'admin@hireflow.com', passwordHash, true]
        }
      );

      userId = result;
      console.log('✅ Admin user created successfully (ID:', userId, ')');
    }

    // Get admin role ID
    const [roles] = await sequelize.query('SELECT id FROM Roles WHERE name = "admin"');
    
    if (roles.length === 0) {
      console.log('❌ Admin role not found. Please run: npm run seed:admin');
      process.exit(1);
    }

    const adminRoleId = roles[0].id;

    // Check if user already has admin role
    const [existingRole] = await sequelize.query(
      'SELECT * FROM UserRoles WHERE user_id = ? AND role_id = ?',
      { replacements: [userId, adminRoleId] }
    );

    if (existingRole.length > 0) {
      console.log('ℹ️  Admin role already assigned');
    } else {
      // Assign admin role
      await sequelize.query(
        'INSERT INTO UserRoles (user_id, role_id) VALUES (?, ?)',
        { replacements: [userId, adminRoleId] }
      );
      console.log('✅ Admin role assigned successfully');
    }

    console.log('\n✨ Setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@hireflow.com');
    console.log('🔑 Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👉 Now you can login at: http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

if (require.main === module) {
  seedAdminUser()
    .then(() => {
      console.log('\n✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedAdminUser;
