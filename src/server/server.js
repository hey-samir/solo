const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const featureFlags = require('./routes/feature-flags');

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
const staticPath = path.resolve(__dirname, '../../dist/client', NODE_ENV);
console.log(`Static files path: ${staticPath}`);

// List contents of static directory
console.log('Contents of static directory:');
try {
  if (fs.existsSync(staticPath)) {
    const files = fs.readdirSync(staticPath, { withFileTypes: true });
    const fileList = files.map(dirent => ({
      name: dirent.name,
      type: dirent.isDirectory() ? 'directory' : 'file',
      path: path.join(staticPath, dirent.name)
    }));
    console.log(JSON.stringify(fileList, null, 2));
  } else {
    console.log('Static directory does not exist, creating it...');
    fs.mkdirSync(staticPath, { recursive: true });
  }
} catch (error) {
  console.error('Error accessing static directory:', error);
}

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://0.0.0.0:3000',
      'http://0.0.0.0:5000'
    ];
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Mount API routes before static files
app.use('/api', apiRoutes);

// Add environment-specific middleware
app.use((req, res, next) => {
  console.log(`[${NODE_ENV}] ${req.method} ${req.path}`);
  // Set environment variable for client
  res.set('X-Environment', NODE_ENV);
  next();
});

// Serve static files
app.use(express.static(staticPath));

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

// Serve index.html for all other routes (SPA support)
app.get('*', async (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  const environment = process.env.NODE_ENV || 'development';

  // Enhanced logging for debugging
  console.log('Request Details:');
  console.log(`- Path requested: ${req.path}`);
  console.log(`- Environment: ${environment}`);

  // Check if the route should be blocked based on feature flags
  const flags = featureFlags.featureFlags[environment];
  if (
    (req.path === '/faq' && !flags.showFAQ) ||
    (req.path.startsWith('/feedback') && !flags.enableFeedback) ||
    (req.path === '/pricing' && !flags.enablePro) ||
    ((req.path === '/squads' || req.path === '/standings') && !flags.enableSquads)
  ) {
    console.log(`Route ${req.path} is disabled by feature flags`);
    return res.status(404).send('Page not found');
  }

  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: Unable to serve index.html in ${environment} environment`);
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