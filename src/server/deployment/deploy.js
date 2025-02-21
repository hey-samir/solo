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
    let PORT;

    // Strict environment-port mapping
    if (environment === 'production') {
      PORT = 3000;
    } else if (environment === 'staging') {
      PORT = 5000;
    } else {
      throw new Error(`Invalid environment: ${environment}`);
    }

    console.log(`[Deploy] Starting deployment for ${environment} environment`);
    console.log(`[Deploy] Target port: ${PORT}`);

    // Enhanced port release process with multiple retries
    console.log('[Deploy] Beginning port release process...');

    const maxRetries = 3;
    let isPortFree = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[Deploy] Attempt ${attempt}/${maxRetries} to free port ${PORT}`);

      // Try to kill any process on the port
      await killProcessOnPort(PORT);
      console.log(`[Deploy] Killed any processes on port ${PORT}`);

      // Force release the port
      await forceReleasePort(PORT);
      console.log(`[Deploy] Forced release of port ${PORT}`);

      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      console.log(`[Deploy] Waiting ${delay}ms before checking port...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check if port is now available
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

    // Start server with additional error handling
    console.log('[Deploy] Starting server...');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log(`[Deploy] Server started in ${environment} mode`);
      console.log(`[Deploy] URL: http://0.0.0.0:${PORT}`);
      console.log(`[Deploy] Process ID: ${process.pid}`);
      console.log('='.repeat(50));
    });

    // Enhanced error handling
    server.on('error', (error) => {
      console.error('[Deploy] Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Deploy] Received SIGTERM signal');
      server.close(() => {
        console.log('[Deploy] Server closed');
        process.exit(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('[Deploy] Uncaught Exception:', err);
      server.close(() => {
        console.log('[Deploy] Server closed due to uncaught exception');
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Deploy] Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        console.log('[Deploy] Server closed due to unhandled rejection');
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('[Deploy] Critical error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  deploy();
}

module.exports = deploy;