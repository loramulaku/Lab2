/**
 * adminSeeder — creates the default admin user + roles if they don't exist.
 *
 * Run with: npm run db:seed
 *
 * What it does:
 *   1. Ensures the 'admin', 'recruiter', 'candidate' roles exist in Roles table.
 *   2. Creates an admin user (email from ADMIN_EMAIL / ADMIN_PASSWORD env vars,
 *      or falls back to sensible defaults for local dev).
 *   3. Assigns the 'admin' role to that user.
 */

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const { connectMySQL } = require('../config/mysql');
const User     = require('../models/sql/User');
const Role     = require('../models/sql/Role');
const UserRole = require('../models/sql/UserRole');

const ROLES = ['admin', 'recruiter', 'candidate'];

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@jobportal.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
const ADMIN_FIRST    = process.env.ADMIN_FIRST    ?? 'Admin';
const ADMIN_LAST     = process.env.ADMIN_LAST     ?? 'User';

async function seed() {
  await connectMySQL();

  // 1. Upsert roles
  const roleMap = {};
  for (const name of ROLES) {
    const [role] = await Role.findOrCreate({ where: { name } });
    roleMap[name] = role.id;
    console.log(`  Role "${name}" ready (id=${role.id})`);
  }

  // 2. Upsert admin user
  let admin = await User.findOne({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    admin = await User.create({
      firstName:    ADMIN_FIRST,
      lastName:     ADMIN_LAST,
      email:        ADMIN_EMAIL,
      passwordHash,
    });
    console.log(`  Created admin user: ${ADMIN_EMAIL}`);
  } else {
    console.log(`  Admin user already exists: ${ADMIN_EMAIL}`);
  }

  // 3. Assign admin role (idempotent)
  const [, created] = await UserRole.findOrCreate({
    where: { userId: admin.id, roleId: roleMap['admin'] },
  });
  if (created) {
    console.log(`  Assigned role "admin" to user id=${admin.id}`);
  } else {
    console.log(`  Role "admin" already assigned`);
  }

  console.log('\nSeed complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
