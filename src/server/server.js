const express = require('express');
const net = require('net');
const app = express();

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('Early uncaught exception:', error);
  process.exit(1);
});

// Basic configuration
const PORT = parseInt(process.env.PORT || '5002', 10);

console.log('='.repeat(50));
console.log('Server Pre-initialization:');
console.log(`Port to bind: ${PORT}`);
console.log(`Process ID: ${process.pid}`);
console.log(`Node Version: ${process.version}`);
console.log(`Memory usage:`, process.memoryUsage());
console.log('='.repeat(50));

// Check if port is in use
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', err => {
        console.error(`Port ${port} check failed:`, err.message);
        resolve(false);
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, '0.0.0.0');
  });
}

// Single test endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server with detailed error handling
if (require.main === module) {
  isPortAvailable(PORT).then(portAvailable => {
    console.log('Port availability check result:', portAvailable);

    if (!portAvailable) {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    }

    console.log(`Port ${PORT} is available, attempting to create server...`);

    const server = app.listen(PORT, '0.0.0.0')
      .on('listening', () => {
        console.log('\nServer Status:');
        console.log('='.repeat(50));
        console.log(`Server is now listening on port ${PORT}`);
        console.log(`URL: http://0.0.0.0:${PORT}`);
        console.log('='.repeat(50));
      })
      .on('error', (error) => {
        console.error('\nServer Error:');
        console.error('='.repeat(50));
        console.error('Failed to start server');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('='.repeat(50));
        process.exit(1);
      });

    process.on('SIGTERM', () => {
      console.log('Received SIGTERM signal');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  }).catch(error => {
    console.error('Port check failed:', error);
    process.exit(1);
  });
}

module.exports = app;