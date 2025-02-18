const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const morgan = require('morgan');
const { checkPort } = require('./utils/port-check');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT || (NODE_ENV === 'production' ? '3000' : '5000'), 10);
const staticPath = path.resolve(__dirname, '../../dist');
const MAX_RETRIES = 5;

// Enhanced startup logging
console.log('[Server] Starting with configuration:', {
  NODE_ENV,
  PORT,
  staticPath,
  timestamp: new Date().toISOString(),
  pid: process.pid,
  platform: process.platform,
  nodeVersion: process.version,
  env: {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    REPL_ID: process.env.REPL_ID,
    REPL_OWNER: process.env.REPL_OWNER,
    REPL_SLUG: process.env.REPL_SLUG
  }
});

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  process.exit(1);
});

// Verify static directory exists
if (!fs.existsSync(staticPath)) {
  console.error(`[Server] Error: Static directory not found at ${staticPath}`);
  process.exit(1);
}

// Extended logging middleware
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`[${NODE_ENV}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for API routes only
const apiCorsMiddleware = cors({
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
});

// Serve static files with proper configuration
app.use(express.static(staticPath, {
  maxAge: NODE_ENV === 'production' ? '1h' : '0',
  etag: true,
  index: false // Don't auto-serve index.html
}));

// Apply CORS only to API routes
app.use('/api', apiCorsMiddleware, apiRoutes);

// Environment-specific API endpoint
app.get('/api/environment', (_req, res) => {
  const forceProduction = process.env.FORCE_PRODUCTION === 'true';
  const isProduction = forceProduction || (NODE_ENV === 'production' && PORT === 3000);

  res.json({
    environment: isProduction ? 'production' : 'staging',
    server_time: new Date().toISOString(),
    is_production: isProduction,
    port: PORT,
    node_env: NODE_ENV
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  const healthy = fs.existsSync(indexPath);

  const healthStatus = {
    status: healthy ? 'ok' : 'error',
    environment: NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString(),
    pid: process.pid,
    details: {
      indexFile: healthy ? 'present' : 'missing',
      staticPath,
      buildExists: fs.existsSync(staticPath)
    }
  };

  res.status(healthy ? 200 : 503).json(healthStatus);
});

// SPA fallback - serve index.html for all non-asset routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || path.extname(req.path)) {
    return next();
  }

  const indexPath = path.join(staticPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error(`[${NODE_ENV}] Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: Unable to serve index.html in ${NODE_ENV} environment`);
  }

  res.sendFile(indexPath);
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Server Error]:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: NODE_ENV !== 'production' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server if not being required as a module
if (require.main === module) {
  let server;
  let retryCount = 0;
  let forceShutdown = false;

  const startServer = async () => {
    if (retryCount >= MAX_RETRIES) {
      console.error(`[Server] Failed to start after ${MAX_RETRIES} attempts. Port ${PORT} may be permanently blocked.`);
      process.exit(1);
    }

    if (forceShutdown) {
      console.log('[Server] Force shutdown requested, stopping startup attempts');
      process.exit(0);
    }

    console.log(`[Server] Attempt ${retryCount + 1}/${MAX_RETRIES} to start server on port ${PORT}`);

    try {
      // Force cleanup any existing handles
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }

      // Check if port is available
      const isPortAvailable = await checkPort(PORT);
      if (!isPortAvailable) {
        retryCount++;
        console.log(`[Server] Port ${PORT} is not available. Waiting before retry...`);
        if (!forceShutdown) {
          setTimeout(startServer, 1000);
        }
        return;
      }

      server = app.listen(PORT, '0.0.0.0')
        .on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            retryCount++;
            console.error(`[Server] Port ${PORT} is in use. Details:`, {
              attempt: retryCount,
              maxRetries: MAX_RETRIES,
              error: error.message,
              timestamp: new Date().toISOString()
            });

            if (!forceShutdown) {
              setTimeout(() => {
                console.log('[Server] Attempting to close previous instance...');
                server.close();
                startServer();
              }, 1000);
            }
          } else {
            console.error('[Server] Critical startup error:', {
              error: error.message,
              code: error.code,
              timestamp: new Date().toISOString()
            });
            process.exit(1);
          }
        })
        .on('listening', () => {
          console.log('='.repeat(50));
          console.log(`[Server] Successfully started on attempt ${retryCount + 1}:`);
          console.log(`[Server] Running in ${NODE_ENV} mode`);
          console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
          console.log(`[Server] Process ID: ${process.pid}`);
          console.log(`[Server] Static files: ${staticPath}`);
          console.log('='.repeat(50));
        });
    } catch (error) {
      console.error('[Server] Unexpected error during startup:', error);
      if (!forceShutdown) {
        retryCount++;
        setTimeout(startServer, 1000);
      }
    }
  };

  // Enhanced shutdown handling
  const shutdown = () => {
    console.log('[Server] Initiating graceful shutdown...', {
      pid: process.pid,
      timestamp: new Date().toISOString()
    });

    forceShutdown = true;

    if (server) {
      server.close((err) => {
        if (err) {
          console.error('[Server] Error during shutdown:', err);
          process.exit(1);
        }
        console.log('[Server] Successfully closed all connections.');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('[Server] Could not close connections in time, forcing shut down');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  // Set up signal handlers
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Attempt to start the server
  startServer().catch((error) => {
    console.error('[Server] Fatal error during startup:', error);
    process.exit(1);
  });
}

module.exports = app;