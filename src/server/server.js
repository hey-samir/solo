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
console.log('='.repeat(50));

// Configure static file serving based on environment
const staticPath = path.join(process.cwd(), 'dist/client', NODE_ENV);
console.log(`Static files path: ${staticPath}`);

// Verify index.html exists
const indexPath = path.join(staticPath, 'index.html');
if (!fs.existsSync(staticPath)) {
  console.error(`Static directory not found: ${staticPath}`);
} else if (!fs.existsSync(indexPath)) {
  console.error(`index.html not found: ${indexPath}`);
} else {
  console.log(`Found index.html at: ${indexPath}`);
}

// Add environment-specific middleware
app.use((req, res, next) => {
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
    timestamp: new Date().toISOString() 
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  // Log the request for debugging
  console.log(`Serving index.html for ${req.path} in ${NODE_ENV} environment`);

  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: index.html not found in ${NODE_ENV} environment`);
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