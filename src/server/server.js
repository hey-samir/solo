const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const { getFeatureFlags } = require('../config/features');

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
const staticPath = path.resolve(__dirname, '../../dist/client', NODE_ENV);
console.log(`Static files path: ${staticPath}`);

// Verify static directory and index.html existence
const indexPath = path.join(staticPath, 'index.html');
console.log('Checking static directory and index.html:');
try {
  if (!fs.existsSync(staticPath)) {
    console.log('Creating static directory...');
    fs.mkdirSync(staticPath, { recursive: true });
  }

  console.log('Contents of static directory:');
  const files = fs.readdirSync(staticPath, { withFileTypes: true });
  const fileList = files.map(dirent => ({
    name: dirent.name,
    type: dirent.isDirectory() ? 'directory' : 'file',
    path: path.join(staticPath, dirent.name)
  }));
  console.log(JSON.stringify(fileList, null, 2));

  if (!fs.existsSync(indexPath)) {
    console.error(`Warning: index.html not found at ${indexPath}`);
    // Copy index.html from project root if it doesn't exist
    const sourceIndexPath = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(sourceIndexPath)) {
      fs.copyFileSync(sourceIndexPath, indexPath);
      console.log(`Copied index.html from ${sourceIndexPath} to ${indexPath}`);
    }
  }
} catch (error) {
  console.error('Error accessing static directory:', error);
}

// Add environment-specific middleware
app.use((req, res, next) => {
  console.log(`[${NODE_ENV}] ${req.method} ${req.path}`);
  // Set environment variable for client
  res.set('X-Environment', NODE_ENV);
  next();
});

// Serve static files with proper caching
app.use(express.static(staticPath, {
  maxAge: NODE_ENV === 'production' ? '1h' : '0',
  etag: true,
  index: false // Don't auto-serve index.html
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

// Add environment endpoint with detailed logging
app.get('/api/environment', (_req, res) => {
  console.log('Environment endpoint called');
  console.log('Current NODE_ENV:', NODE_ENV);
  console.log('Process env:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  });

  res.json({ 
    environment: NODE_ENV,
    server_time: new Date().toISOString()
  });
});

// Add this new endpoint after the environment endpoint
app.get('/api/features', (_req, res) => {
  console.log('Features endpoint called');
  console.log('Current NODE_ENV:', NODE_ENV);

  const features = getFeatureFlags(NODE_ENV);
  console.log('Returning features:', features);

  res.json({ 
    features,
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// SPA fallback route with enhanced error handling
app.get('*', (req, res) => {
  // Enhanced logging for debugging
  console.log('Request Details:');
  console.log(`- Path requested: ${req.path}`);
  console.log(`- Environment: ${NODE_ENV}`);
  console.log(`- Static path: ${staticPath}`);
  console.log(`- Index path: ${indexPath}`);

  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: Unable to serve index.html in ${NODE_ENV} environment. Please ensure the application is built for this environment.`);
  }

  res.sendFile(indexPath);
});

// Start server if not being required as a module
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
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

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

module.exports = app;