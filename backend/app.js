require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const { connectMySQL }   = require('./src/config/mysql');
const { connectMongoDB } = require('./src/config/mongodb');

const jobRoutes          = require('./src/routes/job.routes');
const userRoutes         = require('./src/routes/user.routes');
const planRoutes         = require('./src/routes/plan.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const applicationRoutes  = require('./src/routes/application.routes');
const bidRoutes          = require('./src/routes/bid.routes');
const invitationRoutes   = require('./src/routes/invitation.routes');
const meRoutes           = require('./src/routes/me.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/users',              userRoutes);
app.use('/api/jobs',               jobRoutes);
app.use('/api/jobs/:jobId/apply',  applicationRoutes);
app.use('/api/jobs/:jobId/applications', applicationRoutes);
app.use('/api/jobs/:jobId/bids',   bidRoutes);
app.use('/api/plans',              planRoutes);
app.use('/api/subscriptions',      subscriptionRoutes);
app.use('/api/invitations',        invitationRoutes);
app.use('/api/me',                 meRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
(async () => {
  await connectMySQL();
  await connectMongoDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
