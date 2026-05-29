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
const { connectMySQL }   = require('../config/mysql');
const { connectMongoDB } = require('../config/mongodb');
const User        = require('../models/sql/User');
const Role        = require('../models/sql/Role');
const UserRole    = require('../models/sql/UserRole');
const SiteContent = require('../models/sql/SiteContent');
const { syncSiteContent } = require('../sync/siteContentSync');

const ROLES = ['admin', 'recruiter', 'candidate'];

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@jobportal.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
const ADMIN_FIRST    = process.env.ADMIN_FIRST    ?? 'Admin';
const ADMIN_LAST     = process.env.ADMIN_LAST     ?? 'User';

const DEFAULT_SITE_CONTENT = [
  // ── Home page ───────────────────────────────────────────────────────────────
  { key: 'home.hero.title',       label: 'Home — hero title',       value: 'Welcome to HireFlow' },
  { key: 'home.hero.subtitle',    label: 'Home — hero subtitle',    value: 'Job Portal & Recruitment Platform' },
  { key: 'home.cta.primary',      label: 'Home — primary CTA',      value: 'Login' },
  { key: 'home.cta.secondary',    label: 'Home — secondary CTA',    value: 'Create Account' },
  { key: 'home.guide.title',      label: 'Home — guide title',      value: 'Quick Start Guide' },
  { key: 'home.guide.step1',      label: 'Home — guide step 1',     value: 'Register a new account or sign in.' },
  { key: 'home.guide.step2',      label: 'Home — guide step 2',     value: 'Recruiters can post jobs, candidates can apply.' },
  { key: 'home.guide.step3',      label: 'Home — guide step 3',     value: 'Admins manage everything from the dashboard.' },

  // ── Login page (right panel form) ───────────────────────────────────────────
  { key: 'login.title',               label: 'Login — heading',              value: 'Welcome back' },
  { key: 'login.subtitle',            label: 'Login — subheading',           value: 'Sign in to your account' },
  { key: 'login.email.label',         label: 'Login — email label',          value: 'Email Address' },
  { key: 'login.email.placeholder',   label: 'Login — email placeholder',    value: 'you@example.com' },
  { key: 'login.password.label',      label: 'Login — password label',       value: 'Password' },
  { key: 'login.password.placeholder', label: 'Login — password placeholder', value: 'Your password' },
  { key: 'login.submit',              label: 'Login — submit button',        value: 'Sign In' },
  { key: 'login.submit.loading',      label: 'Login — loading state',        value: 'Signing in…' },
  { key: 'login.footer.prompt',       label: 'Login — footer prompt',        value: "Don't have an account?" },
  { key: 'login.footer.link',         label: 'Login — footer link text',     value: 'Create one' },

  // ── Auth left panel (Login & Register) ──────────────────────────────────────
  {
    key: 'auth.left.hero.title',
    label: 'Auth panel — hero title (use \\n for line breaks)',
    value: 'Join 50,000+ professionals\nalready on HireFlow',
  },
  {
    key: 'auth.left.hero.subtitle',
    label: 'Auth panel — hero subtitle',
    value: "Whether you're looking for your next role or building a world-class team, HireFlow gives you the tools to succeed.",
  },
  {
    key: 'auth.left.features',
    label: 'Auth panel — feature list (one item per line)',
    value: [
      'Free account forever',
      'AI-powered job matching',
      'Real-time pipeline tracking',
      'Integrated messaging',
      'Freelance bidding system',
    ].join('\n'),
  },
  { key: 'auth.left.security.title', label: 'Auth panel — security badge title', value: 'Secure & Private' },
  {
    key: 'auth.left.security.text',
    label: 'Auth panel — security badge text',
    value: 'Your data is encrypted and never sold. We take privacy seriously.',
  },

  // ── Global ──────────────────────────────────────────────────────────────────
  { key: 'site.brand.name',       label: 'Brand name',              value: 'HireFlow' },
  { key: 'site.footer.text',      label: 'Footer text',             value: '© HireFlow. All rights reserved.' },
];

async function seed() {
  await connectMySQL();
  await connectMongoDB();

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

  // 4. Default site content (CMS)
  for (const item of DEFAULT_SITE_CONTENT) {
    const [row, created] = await SiteContent.findOrCreate({
      where: { key: item.key },
      defaults: { ...item, updatedBy: admin.id },
    });
    if (created) console.log(`  Seeded site content: ${item.key}`);
    try { await syncSiteContent(row.id); } catch (e) {
      console.warn(`  Could not sync ${item.key} to MongoDB: ${e.message}`);
    }
  }

  console.log('\nSeed complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
