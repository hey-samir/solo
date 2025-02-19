const path = require('path');
const app = require('../server');
const { forceReleasePort } = require('../utils/port-check');

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

    // Release all ports before starting
    await forceReleasePort(3000);
    await forceReleasePort(5000);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log(`[Deploy] Server started in ${environment} mode`);
      console.log(`[Deploy] URL: http://0.0.0.0:${PORT}`);
      console.log(`[Deploy] Process ID: ${process.pid}`);
      console.log('='.repeat(50));
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