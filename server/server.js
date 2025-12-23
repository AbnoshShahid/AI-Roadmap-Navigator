require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

// CRITICAL: Fail fast if no PORT (Railway requires this)
// But logs showed PORT=8080, so it exists. 
// We will use it, but log heavily.
const PORT = process.env.PORT || 8080;

console.log(`[STARTUP] Starting server on PORT: ${PORT}`);

// 1. Start Server IMMEDIATELY (Do not wait for DB)
// Removing '0.0.0.0' to allow Node to bind to IPv6/IPv4 as per environment preference
const server = app.listen(PORT, () => {
  console.log(`[SERVER] Listening on port ${PORT}`);
  console.log('[SERVER] READY AND ALIVE');
});

// 2. Configure Keep-Alive (Fixes potential load balancer dropouts)
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// 3. Connect to DB in Background
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('⚠️ MONGO_URI not found. Running in non-persistence mode.');
    return;
  }

  try {
    console.log('[DB] Connecting...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    // Do NOT exit process, keeps server alive for health checks
  }
};

connectDB();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
