const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

// Enhanced middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Add logging

// Basic health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple test route
app.get('/api/test', (_req, res) => {
  res.json({ 
    message: 'Server is working!',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production or staging
if (isProduction || isStaging) {
  const clientDir = path.join(__dirname, '../../dist/client');
  console.log(`[${environment}] Serving static files from:`, clientDir);

  // Verify the static directory exists
  const fs = require('fs');
  if (!fs.existsSync(clientDir)) {
    console.warn(`Warning: Static directory not found at ${clientDir}`);
    console.warn('Make sure to run the build process first');
  } else {
    console.log('Static directory verified successfully');
  }

  app.use(express.static(clientDir));

  // Handle client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// Enhanced error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    path: _req.path
  });
});

// Export for use in other files
module.exports = app;

// Start server if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 5001;

  // Verify port is available
  const net = require('net');
  const testServer = net.createServer()
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('Error starting server:', err);
        process.exit(1);
      }
    })
    .once('listening', () => {
      testServer.close();
      startServer();
    })
    .listen(PORT);

  function startServer() {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log(`Server started in ${environment} mode`);
      console.log(`Listening on http://0.0.0.0:${PORT}`);
      console.log(`Process ID: ${process.pid}`);
      console.log(`Node version: ${process.version}`);
      console.log(`Current directory: ${process.cwd()}`);
      console.log('='.repeat(50));
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM signal, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      server.close(() => {
        console.log('Server closed due to uncaught exception');
        process.exit(1);
      });
    });
  }
}