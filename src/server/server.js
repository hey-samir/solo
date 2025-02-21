// Server startup logging
console.log('[Server] Script execution starting:', {
  time: new Date().toISOString(),
  argv: process.argv,
  execPath: process.execPath,
  pid: process.pid,
  env: process.env.NODE_ENV
});

const express = require('express');
const path = require('path');
const { validatePort, forceReleasePort } = require('./utils/port-check');

console.log('[Server] Express and utilities imported successfully');

// Create app
const app = express();

// Configure CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin?.includes('.replit.dev') || 
      origin?.includes('0.0.0.0') || 
      !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Enhanced request logging
app.use((req, res, next) => {
  console.log('[Server] Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  next();
});

// Verify dist directory exists
const distPath = path.join(__dirname, '../../dist');
const env = process.env.NODE_ENV || 'development';
const mainHtml = env === 'staging' ? 'staging.html' : 'index.html';
const indexPath = path.join(distPath, mainHtml);

// Check build exists
if (!require('fs').existsSync(distPath)) {
  console.error('[Server] Error: dist directory not found. Please run build first.');
  process.exit(1);
}

if (!require('fs').existsSync(indexPath)) {
  console.error(`[Server] Error: ${mainHtml} not found in dist directory.`);
  process.exit(1);
}

// Disable caching for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from the dist directory
app.use(express.static(distPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '0' : 0,
  etag: false,
  lastModified: false,
  dotfiles: 'ignore',
  fallthrough: true
}));

// Import and use feature flags router
const { router: featureFlagsRouter } = require('./routes/feature-flags');
app.use('/api/feature-flags', featureFlagsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  console.log('[Server] Serving index.html for path:', req.path);
  res.sendFile(indexPath);
});

// Function to start server
async function startServer() {
  try {
    const env = process.env.NODE_ENV || 'development';
    const port = env === 'staging' ? 5000 : 3000;

    console.log(`[Server] Starting ${env} server on port ${port}...`);

    // Release port before starting
    await forceReleasePort(port);

    // Add delay to ensure port is fully released
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate port availability
    try {
      await validatePort(port, env);
    } catch (err) {
      console.error('[Server] Port validation failed:', err);
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      console.log(`[Server] Binding to port ${port}...`);

      const server = app.listen(port, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`[Server] Successfully started ${env} server on port ${port}`);
        console.log(`[Server] Server URL: http://0.0.0.0:${port}`);
        console.log(`[Server] Process ID: ${process.pid}`);
        console.log(`[Server] Environment: ${env}`);
        console.log(`[Server] Static files being served from: ${distPath}`);
        console.log('='.repeat(50));
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('[Server] Server startup error:', error);
        reject(error);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log('[Server] Received SIGTERM signal');
        server.close(() => {
          console.log('[Server] Server closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('[Server] Critical startup error:', error);
    throw error;
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('[Server] Critical startup error:', error);
    process.exit(1);
  });
}

module.exports = app;