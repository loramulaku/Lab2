require('dotenv').config();
const path           = require('path');
const express        = require('express');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const { connectMySQL }   = require('./src/config/mysql');
const { connectMongoDB } = require('./src/config/mongodb');

const jobRoutes       = require('./src/routes/job.routes');
const userRoutes      = require('./src/routes/user.routes');
const candidateRoutes = require('./src/routes/candidate.routes');
const recruiterRoutes = require('./src/routes/recruiter.routes');
const uploadRoutes    = require('./src/routes/upload.routes');
// Additional module routes will be registered here as each module is built.

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/users',     userRoutes);
app.use('/api/jobs',      jobRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/upload',    uploadRoutes);

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
