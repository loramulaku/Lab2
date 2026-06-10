require('dotenv').config();
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swagger');
const notificationRoutes = require('./src/routes/notification.routes');
const path           = require('path');
const express        = require('express');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const { connectMySQL }   = require('./src/config/mysql');
const { connectMongoDB } = require('./src/config/mongodb');
require('./src/models/sql/associations');

const adminRoutes        = require('./src/routes/admin.routes');
const jobRoutes          = require('./src/routes/job.routes');
const userRoutes         = require('./src/routes/user.routes');
const candidateRoutes    = require('./src/routes/candidate.routes');
const recruiterRoutes    = require('./src/routes/recruiter.routes');
const uploadRoutes       = require('./src/routes/upload.routes');
const themeRoutes        = require('./src/routes/theme.routes');
const pipelineRoutes     = require('./src/routes/pipeline.routes');
const planRoutes         = require('./src/routes/plan.routes');
const categoryRoutes     = require('./src/routes/category.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const bidRoutes          = require('./src/routes/bid.routes');
const invitationRoutes   = require('./src/routes/invitation.routes');
const contractRoutes     = require('./src/routes/contract.routes');
const conversationRoutes = require('./src/routes/conversation.routes');
const exportRoutes       = require('./src/routes/export.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use('/api/notifications', notificationRoutes);
app.use(cookieParser());

// Stripe webhook must receive the raw body — apply raw parser only to that route
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/exports', express.static(path.join(__dirname, 'public/exports')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs',  jobRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/upload',    uploadRoutes);
app.use('/api/theme',     themeRoutes);
app.use('/api/pipeline',      pipelineRoutes);
app.use('/api/plans',         planRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/contracts',     contractRoutes);
// Hybrid hiring flow — full paths declared inside the routers (e.g. /jobs/:id/bids)
app.use('/api', bidRoutes);
app.use('/api', invitationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/exports',      exportRoutes);

// ── API Documentation ─────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'HireWire API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Serve React SPA ──────────────────────────────────────────────────────────
const clientDir = path.join(__dirname, 'public/client');
app.use(express.static(clientDir));
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/exports')) return next();
  res.sendFile(path.join(clientDir, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const body = { message: err.message ?? 'Internal server error' };
  if (err.code)          body.code          = err.code;
  if (err.suggestedPlan) body.suggestedPlan = err.suggestedPlan;
  res.status(err.status ?? 500).json(body);
});


// ── Boot ──────────────────────────────────────────────────────────────────────
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow same-origin requests (no origin header) and any localhost port in dev.
      // In production set FRONTEND_URL to your deployed frontend domain.
      if (!origin) return callback(null, true);
      if (origin.startsWith('http://localhost:')) return callback(null, true);
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
      callback(new Error(`Socket.IO CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }
});

module.exports = { io };

const { setIo } = require('./src/socket/ioInstance');
setIo(io);

const initChatSocket = require('./src/socket/chatSocket');
initChatSocket(io);

const { startupSync } = require('./src/sync/startupSync');

(async () => {
  await connectMySQL();
  await connectMongoDB();
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  startupSync();
})();