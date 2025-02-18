// This is the very first line of code to execute
console.log('[Server] Script execution starting:', {
  time: new Date().toISOString(),
  argv: process.argv,
  execPath: process.execPath,
  pid: process.pid
});

// Early process debug info
process.on('exit', (code) => {
  console.log(`[Server] Process exit with code: ${code}`);
});

// Immediate startup logging
console.log('[Server] Process environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PWD: process.env.PWD,
  PATH: process.env.PATH,
  timestamp: new Date().toISOString()
});

const express = require('express');
const path = require('path');
console.log('[Server] Express imported successfully');

// Create minimal app
const app = express();

// Serve static files based on environment
app.use(express.static(path.join(__dirname, '../../dist')));

// Import and use feature flags router
const { router: featureFlagsRouter } = require('./routes/feature-flags');
app.use('/api/feature-flags', featureFlagsRouter);

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Function to start server with proper error handling
function startServer(port, env) {
  return new Promise((resolve, reject) => {
    console.log('[Server] Attempting to create server instance...');

    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[Server] Successfully bound to port ${port} in ${env} mode`);
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('[Server] Server startup error:', {
        message: error.message,
        code: error.code,
        syscall: error.syscall,
        address: error.address,
        port: error.port
      });
      reject(error);
    });
  });
}

if (require.main === module) {
  try {
    // Environment and port configuration
    const NODE_ENV = process.env.NODE_ENV || 'development';
    // Use port 3000 for production, 5000 for staging
    const PORT = process.env.PORT || (NODE_ENV === 'production' ? 3000 : 5000);

    console.log('[Server] Attempting to start with configuration:', {
      NODE_ENV,
      PORT,
      timestamp: new Date().toISOString()
    });

    // Start server immediately
    startServer(PORT, NODE_ENV).catch((error) => {
      console.error('[Server] Failed to start server:', error);
      process.exit(1);
    });

    // Basic error handling
    process.on('uncaughtException', (error) => {
      console.error('[Server] Uncaught exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('[Server] Critical error during startup:', error);
    process.exit(1);
  }
}

module.exports = app;