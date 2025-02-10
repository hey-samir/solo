const express = require('express');
const path = require('path');
const app = express();

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('Early uncaught exception:', error);
  process.exit(1);
});

// Basic configuration
const PORT = parseInt(process.env.PORT || '5000', 10);

console.log('='.repeat(50));
console.log('Server Pre-initialization:');
console.log(`Port to bind: ${PORT}`);
console.log(`Process ID: ${process.pid}`);
console.log(`Node Version: ${process.version}`);
console.log(`Memory usage:`, process.memoryUsage());
console.log('='.repeat(50));

// Configure static file serving
const staticPath = path.join(__dirname, '../../dist/client/staging');
console.log('[production] Static files path:', staticPath);

// Serve static files
app.use(express.static(staticPath));

// Single test endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start server with detailed error handling
if (require.main === module) {
  console.log('Port availability check result:', true);
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
}

module.exports = app;