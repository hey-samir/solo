const path = require('path');
const { startServer } = require('../server');
const { getConfig, ENV_CONFIG } = require('../config/environment');
const net = require('net');
const fs = require('fs');

// Enhanced port management with increased timeout and better cleanup
async function releasePort(port, maxAttempts = 5) {
  console.log(`[Deploy] Attempting to release port ${port}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const server = net.createServer()
          .once('error', () => {
            const tester = net.connect(port)
              .once('error', () => {
                console.log(`[Deploy] Port ${port} is not actually in use (attempt ${attempt})`);
                resolve(true);
              })
              .once('connect', () => {
                console.log(`[Deploy] Found existing connection on port ${port}, attempting to close`);
                tester.end();
                resolve(false);
              });
          })
          .once('listening', () => {
            console.log(`[Deploy] Successfully claimed port ${port}`);
            server.close(() => resolve(true));
          })
          .listen(port);

        // Add timeout to prevent hanging
        setTimeout(() => {
          server.close();
          resolve(false);
        }, 5000);
      });

      // Add delay between attempts
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`[Deploy] Error releasing port ${port} (attempt ${attempt}):`, error);
    }
  }
}

// Find available port from the configured options
async function findAvailablePort(ports) {
  if (!Array.isArray(ports)) {
    ports = [ports];
  }

  for (const port of ports) {
    try {
      await releasePort(port);
      const server = net.createServer();

      const isAvailable = await new Promise(resolve => {
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port);
      });

      if (isAvailable) {
        console.log(`[Deploy] Found available port: ${port}`);
        return port;
      }
    } catch (error) {
      console.error(`[Deploy] Error checking port ${port}:`, error);
    }
  }

  throw new Error(`No available ports found from options: ${ports.join(', ')}`);
}

// Verify build directory
async function verifyBuildDirectory(buildDir) {
  return new Promise((resolve, reject) => {
    fs.access(buildDir, fs.constants.R_OK, (err) => {
      if (err) {
        console.error('[Deploy] Build directory access error:', {
          error: err.message,
          buildDir,
          contents: fs.existsSync(path.dirname(buildDir)) ? 
            fs.readdirSync(path.dirname(buildDir)) : 
            'parent directory not found'
        });
        reject(new Error(`Build directory not accessible: ${buildDir}`));
        return;
      }

      const contents = fs.readdirSync(buildDir);
      console.log('[Deploy] Build directory verified:', {
        path: buildDir,
        contents,
        cwd: process.cwd()
      });
      resolve(contents);
    });
  });
}

// Enhanced deployment with better error handling and port management
async function deploy() {
  let server = null;

  try {
    // Get configuration
    const config = getConfig();
    const buildDir = config.clientDir;
    let availablePort;

    console.log('='.repeat(50));
    console.log(`[Deploy] Starting deployment for ${process.env.NODE_ENV} environment`);
    console.log('[Deploy] Configuration:', {
      environment: process.env.NODE_ENV,
      ports: config.ports || config.port,
      buildDir,
      template: config.templateName,
      time: new Date().toISOString(),
      pid: process.pid
    });
    console.log('='.repeat(50));

    // Verify build directory
    await verifyBuildDirectory(buildDir);

    // Find available port
    if (process.env.NODE_ENV === 'staging' && Array.isArray(config.ports)) {
      availablePort = await findAvailablePort(config.ports);
      config.port = availablePort;
    } else {
      availablePort = config.port;
      await releasePort(availablePort);
    }

    // Start server with enhanced error handling
    console.log(`[Deploy] Starting server on port ${availablePort}...`);
    try {
      server = await startServer(config);
    } catch (error) {
      console.error('[Deploy] Failed to start server:', error);
      throw error;
    }

    // Setup cleanup handlers
    const cleanup = async (signal) => {
      console.log(`[Deploy] Received ${signal}, initiating graceful shutdown...`);
      if (server) {
        server.close(() => {
          console.log('[Deploy] Server closed successfully');
          process.exit(0);
        });

        // Force exit after timeout
        setTimeout(() => {
          console.error('[Deploy] Could not close connections in time, forcing shutdown');
          process.exit(1);
        }, 10000);
      } else {
        process.exit(0);
      }
    };

    // Register signal handlers
    ['SIGTERM', 'SIGINT', 'UNCAUGHT_EXCEPTION', 'UNHANDLED_REJECTION'].forEach(signal => {
      process.on(signal, () => cleanup(signal));
    });

    return server;
  } catch (error) {
    console.error('[Deploy] Critical deployment error:', {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });

    if (server) {
      server.close(() => {
        console.log('[Deploy] Server closed due to error');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
}

// Auto-start if running directly
if (require.main === module) {
  deploy().catch((error) => {
    console.error('[Deploy] Failed to deploy:', error);
    process.exit(1);
  });
}

module.exports = deploy;