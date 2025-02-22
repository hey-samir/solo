const path = require('path');
const { startServer } = require('../server');
const { getConfig, ENV_CONFIG } = require('../config/environment');
const { validateBuildArtifacts } = require('../utils/build-validator');
const net = require('net');
const fs = require('fs');
const crypto = require('crypto');

// Add session secret generation if not exists
function generateSessionSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Enhanced port check with better error handling and detailed logging
async function isPortAvailable(port) {
  console.log(`[Deploy] Checking availability for port ${port}...`);
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        console.log(`[Deploy] Port ${port} is in use:`, err.message);
        resolve(false);
      })
      .once('listening', () => {
        console.log(`[Deploy] Successfully bound to port ${port} for testing`);
        tester.close(() => {
          console.log(`[Deploy] Released test binding on port ${port}`);
          resolve(true);
        });
      })
      .listen(port, '0.0.0.0');
  });
}

// Find first available port from list with detailed logging
async function findAvailablePort(ports) {
  // For staging, always try port 5000 first
  if (process.env.NODE_ENV === 'staging') {
    console.log('[Deploy] Staging environment detected, prioritizing port 5000');
    if (await isPortAvailable(5000)) {
      console.log('[Deploy] Successfully secured port 5000 for staging');
      return 5000;
    }
  }

  if (!Array.isArray(ports)) {
    ports = [ports];
  }

  console.log(`[Deploy] Starting port availability check for ports: ${ports.join(', ')}`);

  for (const port of ports) {
    console.log(`[Deploy] Attempting to use port ${port}`);
    if (await isPortAvailable(port)) {
      console.log(`[Deploy] Successfully found available port: ${port}`);
      return port;
    }
    console.log(`[Deploy] Port ${port} is not available, trying next port`);
    // Add delay between checks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`No available ports found from options: ${ports.join(', ')}`);
}

// Verify build directory with improved error handling and logging
async function verifyBuildDirectory(buildDir) {
  console.log(`[Deploy] Verifying build directory: ${buildDir}`);

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

// Enhanced deployment with build validation and staging environment handling
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

    // Validate build artifacts
    console.log('[Deploy] Starting build validation');
    const buildValidation = await validateBuildArtifacts(buildDir, process.env.NODE_ENV);
    console.log('[Deploy] Build validation successful:', buildValidation);

    // Verify build directory structure after validation
    await verifyBuildDirectory(buildDir);

    // Generate session secret if not exists
    if (!process.env.SESSION_SECRET) {
      process.env.SESSION_SECRET = generateSessionSecret();
      console.log('[Deploy] Generated new session secret');
    }

    // Find available port
    if (process.env.NODE_ENV === 'staging' && Array.isArray(config.ports)) {
      availablePort = await findAvailablePort(config.ports);
      config.port = availablePort;
    } else {
      availablePort = config.port;
      await isPortAvailable(availablePort);
    }

    // Ensure template file exists for staging
    if (process.env.NODE_ENV === 'staging') {
      const srcTemplate = path.join(buildDir, 'src/templates/staging.html');
      const destTemplate = path.join(buildDir, 'staging.html');
      if (fs.existsSync(srcTemplate) && !fs.existsSync(destTemplate)) {
        fs.copyFileSync(srcTemplate, destTemplate);
        console.log('[Deploy] Copied staging template to root directory');
      }
    }

    // Start server with enhanced error handling
    console.log(`[Deploy] Starting server on port ${availablePort}...`);
    try {
      console.log('[Server] Attempting to create HTTP server...');
      console.log('[Server] Configuration for startup:', {
        port: availablePort,
        host: '0.0.0.0',
        environment: process.env.NODE_ENV,
        clientDir: buildDir,
        templateName: config.templateName
      });

      server = await startServer({
        ...config,
        port: availablePort,
        host: '0.0.0.0',
        environment: process.env.NODE_ENV,
        clientDir: buildDir,
        templateName: config.templateName
      });

      console.log('='.repeat(50));
      console.log('[Server] Successfully started on port', availablePort);
      console.log('[Server] Environment:', process.env.NODE_ENV);
      console.log('[Server] URL:', `http://0.0.0.0:${availablePort}`);
      console.log('[Server] Server state:', {
        port: availablePort,
        address: '0.0.0.0',
        clientDir: {
          exists: fs.existsSync(buildDir),
          contents: fs.existsSync(buildDir) ? fs.readdirSync(buildDir) : []
        }
      });
      console.log('='.repeat(50));

    } catch (error) {
      console.error('[Deploy] Failed to start server:', error);
      throw error;
    }

    // Register signal handlers
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