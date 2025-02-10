const express = require('express');
const path = require('path');
const fs = require('fs');
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
console.log(`Current working directory: ${process.cwd()}`);
console.log('='.repeat(50));

// Configure static file serving based on environment
const staticPath = path.join(process.cwd(), 'dist', 'client', NODE_ENV);
console.log(`Static files path: ${staticPath}`);

// Verify directory structure
if (!fs.existsSync(staticPath)) {
  console.error(`Static directory not found: ${staticPath}`);
  console.log('Creating directory structure...');
  fs.mkdirSync(staticPath, { recursive: true });
}

// Add environment-specific middleware
app.use((req, res, next) => {
  // Log all requests
  console.log(`[${NODE_ENV}] ${req.method} ${req.path}`);
  // Add environment info to all responses
  res.locals.environment = NODE_ENV;
  next();
});

// Serve static files with proper MIME types
app.use(express.static(staticPath, {
  index: false, // Don't serve index.html automatically
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    static_path: staticPath
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');

  // Enhanced logging for debugging
  console.log('Request Details:');
  console.log(`- Path requested: ${req.path}`);
  console.log(`- Environment: ${NODE_ENV}`);
  console.log(`- Static path: ${staticPath}`);
  console.log(`- Index path: ${indexPath}`);
  console.log(`- Index exists: ${fs.existsSync(indexPath)}`);

  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html not found at ${indexPath}`);
    const dirs = fs.readdirSync(staticPath);
    console.log(`Contents of ${staticPath}:`, dirs);
    return res.status(500).send(`Error: index.html not found in ${NODE_ENV} environment. Available files: ${dirs.join(', ')}`);
  }

  res.sendFile(indexPath);
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