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
const staticPath = path.resolve(process.cwd(), 'dist', 'client', NODE_ENV);
console.log(`Static files path: ${staticPath}`);

// Verify directory structure and contents
if (!fs.existsSync(staticPath)) {
  console.log('Creating directory structure...');
  fs.mkdirSync(staticPath, { recursive: true });
}

// List contents of static directory
console.log('Contents of static directory:');
if (fs.existsSync(staticPath)) {
  const files = fs.readdirSync(staticPath);
  console.log(files);
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
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    // Add caching headers in production
    if (NODE_ENV === 'production') {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
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

  // List directory contents if index.html not found
  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html not found at ${indexPath}`);
    try {
      const dirs = fs.readdirSync(staticPath, { withFileTypes: true });
      const fileList = dirs.map(dirent => ({
        name: dirent.name,
        type: dirent.isDirectory() ? 'directory' : 'file'
      }));
      console.log(`Contents of ${staticPath}:`, fileList);
      return res.status(500).send(`Error: index.html not found in ${NODE_ENV} environment. Available files: ${JSON.stringify(fileList, null, 2)}`);
    } catch (error) {
      console.error('Error reading directory:', error);
      return res.status(500).send(`Error: Unable to serve index.html in ${NODE_ENV} environment`);
    }
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