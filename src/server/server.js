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
const { validatePort, forceReleasePort } = require('./utils/port-check');

console.log('[Server] Express and utilities imported successfully');

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

// Function to start server with strict port validation
async function startServer(env) {
  try {
    // Determine port based on environment
    const port = env === 'production' ? 3000 : 5000;

    console.log(`[Server] Attempting to start ${env} server on port ${port}...`);

    // First attempt to release the port
    try {
      console.log(`[Server] Attempting to release port ${port} before binding...`);
      await forceReleasePort(port);
      console.log(`[Server] Successfully released port ${port}`);
    } catch (releaseError) {
      console.log(`[Server] Port ${port} release attempt completed:`, releaseError.message);
    }

    // Validate port availability and environment compatibility
    await validatePort(port, env);

    return new Promise((resolve, reject) => {
      console.log(`[Server] Binding to port ${port}...`);

      const server = app.listen(port, '0.0.0.0', () => {
        // Store the port used in the app
        app.set('port', port);

        // Log in a structured format for workflow configuration
        const portAssignment = {
          type: 'SERVER_PORT_ASSIGNMENT',
          port: port,
          env: env,
          timestamp: new Date().toISOString()
        };
        console.log('[Server Status]', JSON.stringify(portAssignment));
        console.log(`[Server] Successfully started ${env} server on port ${port}`);
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
  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    throw error;
  }
}

if (require.main === module) {
  // Environment configuration
  const NODE_ENV = process.env.NODE_ENV || 'development';

  console.log('[Server] Starting with configuration:', {
    NODE_ENV,
    PORT: process.env.PORT,
    timestamp: new Date().toISOString()
  });

  // Start server with error handling
  startServer(NODE_ENV).catch((error) => {
    console.error('[Server] Critical startup error:', error);
    process.exit(1);
  });

  // Process error handling
  process.on('uncaughtException', (error) => {
    console.error('[Server] Uncaught exception:', error);
    process.exit(1);
  });
}

module.exports = app;