const express = require('express');
const cors = require('cors');
const { checkPort, forceReleasePort, listProcessesOnPort } = require('./utils/port-check');
const apiRoutes = require('./routes');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
// Temporarily use port 3001 for testing
const PORT = parseInt(process.env.PORT || '3001', 10);
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    environment: NODE_ENV,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  const startServer = async () => {
    let retryCount = 0;

    const tryStart = async () => {
      console.log(`[Server] Starting attempt ${retryCount + 1}/${MAX_RETRIES}`);
      console.log(`[Server] Environment: ${NODE_ENV}, Port: ${PORT}`);

      // List processes before attempting to start
      await listProcessesOnPort(PORT);

      const portAvailable = await checkPort(PORT);
      if (!portAvailable) {
        console.log(`[Server] Port ${PORT} unavailable, attempting force release`);
        await forceReleasePort(PORT);

        retryCount++;
        if (retryCount < MAX_RETRIES) {
          console.log(`[Server] Retrying in ${RETRY_DELAY}ms...`);
          setTimeout(tryStart, RETRY_DELAY);
          return;
        }

        console.error(`[Server] Failed to start after ${MAX_RETRIES} attempts`);
        process.exit(1);
      }

      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`[Server] Successfully started on port ${PORT}`);
        console.log(`[Server] Environment: ${NODE_ENV}`);
        console.log('='.repeat(50));
      });

      server.on('error', (error) => {
        console.error('[Server] Error:', error);
        process.exit(1);
      });

      // Graceful shutdown
      const shutdown = () => {
        console.log('[Server] Shutting down...');
        server.close(() => process.exit(0));
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    };

    try {
      await tryStart();
    } catch (error) {
      console.error('[Server] Fatal error:', error);
      process.exit(1);
    }
  };

  startServer().catch(error => {
    console.error('[Server] Startup error:', error);
    process.exit(1);
  });
}

module.exports = app;