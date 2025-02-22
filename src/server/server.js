const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { getConfig } = require('./config/environment');

// Initialize environment configuration
const config = getConfig();
console.log('[Server] Initializing with configuration:', {
  environment: process.env.NODE_ENV,
  port: config.port,
  templatePath: path.join(config.clientDir, config.templateName)
});

// Create Express app
const app = express();

// Enhanced logging middleware
app.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]'));

// Parse JSON bodies
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.corsOrigins.some(domain => origin.includes(domain))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Import routes
const featureFlagsRouter = require('./routes/feature-flags').router;
const statsRouter = require('./routes/stats');
const feedbackRouter = require('./routes/feedback');

// Mount API routes
app.use('/api/stats', statsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/feature-flags', featureFlagsRouter);

// Health check endpoint with enhanced diagnostics
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    clientDir: {
      path: config.clientDir,
      exists: require('fs').existsSync(config.clientDir),
      template: path.join(config.clientDir, config.templateName)
    }
  });
});

// Serve static files
app.use(express.static(config.clientDir, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: process.env.NODE_ENV === 'production',
  lastModified: process.env.NODE_ENV === 'production'
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(config.clientDir, config.templateName));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Improved server startup with enhanced error handling and detailed logging
function startServer() {
  return new Promise((resolve, reject) => {
    let server;

    // Create server with error handling
    try {
      console.log('[Server] Attempting to create HTTP server...');
      console.log('[Server] Configuration for startup:', {
        port: config.port,
        host: '0.0.0.0',
        environment: process.env.NODE_ENV,
        clientDir: config.clientDir,
        templateName: config.templateName
      });

      server = app.listen(config.port, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`[Server] Successfully started on port ${config.port}`);
        console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
        console.log(`[Server] URL: http://0.0.0.0:${config.port}`);
        console.log('[Server] Server state:', {
          port: server.address().port,
          address: server.address().address,
          clientDir: {
            exists: require('fs').existsSync(config.clientDir),
            contents: require('fs').readdirSync(config.clientDir)
          }
        });
        console.log('='.repeat(50));
        resolve(server);
      });

      // Enhanced error handling for server
      server.on('error', (error) => {
        console.error('[Server] Failed to start server:', {
          error: error.message,
          code: error.code,
          syscall: error.syscall,
          port: config.port,
          stack: error.stack
        });

        if (error.code === 'EADDRINUSE') {
          reject(new Error(`Port ${config.port} is already in use`));
        } else {
          reject(error);
        }
      });

      // Cleanup handler
      const cleanup = (signal) => {
        console.log(`[Server] Received ${signal}, initiating graceful shutdown...`);
        server.close(() => {
          console.log('[Server] Server closed successfully');
          process.exit(0);
        });

        // Force close after timeout
        setTimeout(() => {
          console.error('[Server] Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      };

      // Setup signal handlers
      ['SIGTERM', 'SIGINT'].forEach(signal => {
        process.on(signal, () => cleanup(signal));
      });

    } catch (error) {
      console.error('[Server] Critical error during server creation:', {
        error: error.message,
        stack: error.stack,
        config: {
          port: config.port,
          environment: process.env.NODE_ENV,
          clientDir: config.clientDir
        }
      });
      reject(error);
    }
  });
}

module.exports = { app, startServer };