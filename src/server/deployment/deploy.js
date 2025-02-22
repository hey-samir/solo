const path = require('path');
const app = require('../server');
const { forceReleasePort, killProcessOnPort } = require('../utils/port-check');
const net = require('net');

// Helper function to check if port is truly available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true))
          .close();
      })
      .listen(port);
  });
}

async function deploy() {
  try {
    const environment = process.env.NODE_ENV || 'production';
    const PORT = environment === 'staging' ? 5000 : 3000;

    console.log('='.repeat(50));
    console.log(`[Deploy] Starting deployment for ${environment} environment`);
    console.log(`[Deploy] Target port: ${PORT}`);
    console.log(`[Deploy] Current time: ${new Date().toISOString()}`);
    console.log(`[Deploy] Process ID: ${process.pid}`);
    console.log('='.repeat(50));

    // Enhanced port release process with multiple retries
    console.log('[Deploy] Beginning port release process...');

    const maxRetries = 3;
    let isPortFree = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[Deploy] Attempt ${attempt}/${maxRetries} to free port ${PORT}`);

      // Kill any existing process on the port
      await killProcessOnPort(PORT);
      console.log(`[Deploy] Killed any processes on port ${PORT}`);

      // Force release the port
      await forceReleasePort(PORT);
      console.log(`[Deploy] Forced release of port ${PORT}`);

      // Add delay with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`[Deploy] Waiting ${delay}ms before checking port...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Verify port availability
      isPortFree = await isPortAvailable(PORT);
      if (isPortFree) {
        console.log(`[Deploy] Successfully freed port ${PORT} on attempt ${attempt}`);
        break;
      }

      console.log(`[Deploy] Port ${PORT} still not available after attempt ${attempt}`);
    }

    if (!isPortFree) {
      throw new Error(`Failed to free port ${PORT} after ${maxRetries} attempts`);
    }

    // Start server with enhanced error handling
    console.log('[Deploy] Starting server...');

    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`[Deploy] Server successfully started`);
        console.log(`[Deploy] Environment: ${environment}`);
        console.log(`[Deploy] URL: http://0.0.0.0:${PORT}`);
        console.log(`[Deploy] Process ID: ${process.pid}`);
        console.log(`[Deploy] Time: ${new Date().toISOString()}`);
        console.log('='.repeat(50));
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('[Deploy] Server startup error:', error);
        if (error.code === 'EADDRINUSE') {
          console.error(`[Deploy] Port ${PORT} is still in use. Please check for other processes.`);
        }
        reject(error);
      });

      // Enhanced error handling
      process.on('uncaughtException', (err) => {
        console.error('[Deploy] Uncaught Exception:', err);
        server.close(() => {
          console.log('[Deploy] Server closed due to uncaught exception');
          process.exit(1);
        });
      });

      process.on('unhandledRejection', (reason, promise) => {
        console.error('[Deploy] Unhandled Rejection at:', promise, 'reason:', reason);
        server.close(() => {
          console.log('[Deploy] Server closed due to unhandled rejection');
          process.exit(1);
        });
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('[Deploy] Received SIGTERM signal');
        server.close(() => {
          console.log('[Deploy] Server closed gracefully');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('[Deploy] Critical deployment error:', error);
    throw error;
  }
}

if (require.main === module) {
  deploy().catch((error) => {
    console.error('[Deploy] Failed to deploy:', error);
    process.exit(1);
  });
}

module.exports = deploy;