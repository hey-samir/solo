const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logging for requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5001', 
      'http://0.0.0.0:3000',
      'http://0.0.0.0:5001', 
      ...(process.env.REPL_SLUG ? [
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      ] : [])
    ];
    callback(null, allowedOrigins.includes(origin) || origin?.includes('repl.co'));
  },
  credentials: true
}));

// Basic health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount routes with error handling
try {
  console.log('[Server] Mounting API routes...');
  app.use('/api', routes);
  console.log('[Server] API routes mounted successfully');
} catch (error) {
  console.error('[Server] Failed to mount routes:', error);
  process.exit(1);
}

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
  // Temporarily use port 5001 for staging to verify server functionality
  const PORT = process.env.NODE_ENV === 'production' ? 3000 : 5001;

  console.log('[Server] Starting with configuration:', {
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    timestamp: new Date().toISOString()
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`[Server] Started in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[Server] Listening on port ${PORT}`);
    console.log(`[Server] Process ID: ${process.pid}`);
    console.log('='.repeat(50));
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use. Please ensure no other server is running.`);
    } else {
      console.error('[Server] Failed to start:', {
        error: error.message,
        code: error.code,
        syscall: error.syscall,
        address: error.address,
        port: error.port
      });
    }
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