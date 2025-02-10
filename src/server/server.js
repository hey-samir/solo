const express = require('express');
const path = require('path');
const app = express();

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('Early uncaught exception:', error);
  process.exit(1);
});

// Basic configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('='.repeat(50));
console.log('Server Pre-initialization:');
console.log(`Environment: ${NODE_ENV}`);
console.log(`Port to bind: ${PORT}`);
console.log(`Process ID: ${process.pid}`);
console.log(`Node Version: ${process.version}`);
console.log('='.repeat(50));

// Configure static file serving based on environment
const staticPath = path.join(__dirname, '../../dist/client', NODE_ENV === 'production' ? 'production' : 'staging');
console.log(`Static files path: ${staticPath}`);

// Serve static files
app.use(express.static(staticPath));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the appropriate HTML file for all other routes (SPA support)
app.get('*', (_req, res) => {
  const htmlFile = NODE_ENV === 'production' ? 'production.html' : 'staging.html';
  res.sendFile(path.join(staticPath, htmlFile));
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\nServer Status:');
    console.log('='.repeat(50));
    console.log(`Server is running in ${NODE_ENV} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Static files being served from: ${staticPath}`);
    console.log('='.repeat(50));
  }).on('error', (error) => {
    console.error('\nServer Error:');
    console.error('='.repeat(50));
    console.error('Failed to start server');
    console.error('Error:', error);
    console.error('='.repeat(50));
    process.exit(1);
  });
}

module.exports = app;