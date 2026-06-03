require('dotenv').config();
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
const subscriptionRoutes = require('./src/routes/subscription.routes');
const bidRoutes          = require('./src/routes/bid.routes');
const invitationRoutes   = require('./src/routes/invitation.routes');
const contractRoutes     = require('./src/routes/contract.routes');
const conversationRoutes = require('./src/routes/conversation.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use('/api/notifications', notificationRoutes);
app.use(cookieParser());

// Stripe webhook must receive the raw body before express.json() parses it
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionRoutes);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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
app.use('/api/contracts',     contractRoutes);
// Hybrid hiring flow — full paths declared inside the routers (e.g. /jobs/:id/bids)
app.use('/api', bidRoutes);
app.use('/api', invitationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/conversations', conversationRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' });
});


// ── Boot ──────────────────────────────────────────────────────────────────────
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

module.exports = { io };

const initChatSocket = require('./src/socket/chatSocket');
initChatSocket(io);

(async () => {
  await connectMySQL();
  await connectMongoDB();
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();