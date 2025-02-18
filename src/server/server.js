const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: featureFlagsRouter } = require('./routes/feature-flags');
const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://0.0.0.0:3000',
      'http://0.0.0.0:5000',
      ...(process.env.REPL_SLUG ? [
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      ] : [])
    ];
    callback(null, allowedOrigins.includes(origin) || origin?.includes('repl.co') || origin?.includes('replit.dev'));
  },
  credentials: true
}));

// Mount feature flags router at the correct path
app.use('/api/feature-flags', featureFlagsRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ 
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  const environment = process.env.NODE_ENV || 'development';
  const PORT = environment === 'production' ? 3000 : 5000;

  // Enhanced logging for startup
  console.log('[Server] Starting with configuration:', {
    environment,
    port: PORT,
    timestamp: new Date().toISOString(),
    pid: process.pid
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`[Server] Started in ${environment} mode`);
    console.log(`[Server] Listening on port ${PORT}`);
    console.log(`[Server] Process ID: ${process.pid}`);
    console.log('='.repeat(50));
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('[Server] Failed to start:', error);
    console.error('[Server] Error details:', {
      code: error.code,
      message: error.message,
      syscall: error.syscall,
      port: PORT
    });
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] Received SIGTERM signal, shutting down gracefully');
    server.close(() => {
      console.log('[Server] Closed all connections');
      process.exit(0);
    });
  });
}

module.exports = app;