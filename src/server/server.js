// This is the very first line of code to execute
console.log('[Server] Script execution starting:', {
  time: new Date().toISOString(),
  argv: process.argv,
  execPath: process.execPath,
  pid: process.pid
});

// Early process debug info
process.on('exit', (code) => {
  console.log(`[Server] Process exit with code: ${code}`);
});

// Immediate startup logging
console.log('[Server] Process environment:', {
  NODE_ENV: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

const express = require('express');
const path = require('path');
const { validatePort, forceReleasePort } = require('./utils/port-check');

console.log('[Server] Express and utilities imported successfully');

// Create minimal app
const app = express();

// Configure CORS and other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Configure static file serving with appropriate caching
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '0' : 0, // Disable caching temporarily
  etag: false, // Disable ETags to prevent caching
  lastModified: false, // Disable Last-Modified to prevent caching
  dotfiles: 'ignore',
  fallthrough: true
};

// Verify dist directory exists
const distPath = path.join(__dirname, '../../dist');
const indexPath = path.join(distPath, 'index.html');

// Check if build exists
if (!require('fs').existsSync(distPath)) {
  console.error('[Server] Error: dist directory not found. Please run build first.');
  process.exit(1);
}

if (!require('fs').existsSync(indexPath)) {
  console.error('[Server] Error: index.html not found in dist directory.');
  process.exit(1);
}

// Serve static files with cache busting
app.use((req, res, next) => {
  // Log incoming requests for debugging
  console.log('[Server] Incoming request:', {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Serve static files from the dist directory
app.use(express.static(distPath, staticOptions));

// Import and use feature flags router
const { router: featureFlagsRouter } = require('./routes/feature-flags');
app.use('/api/feature-flags', featureFlagsRouter);

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  console.log('[Server] Serving index.html for path:', req.path);
  res.sendFile(indexPath);
});

// Function to start server with strict port validation
async function startServer() {
  try {
    // Strictly enforce environment-specific ports
    const env = process.env.NODE_ENV || 'production';
    const port = env === 'staging' ? 5000 : 3000;

    console.log(`[Server] Starting ${env} server on port ${port}...`, {
      environment: env,
      port: port,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    // Release only our specific port before starting
    console.log(`[Server] Releasing port ${port} before startup...`);
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
        console.log(`[Server] Static files being served from: ${distPath}`);
        console.log('='.repeat(50));
        resolve(server);
      });

      server.on('error', (error) => {
        console.error('[Server] Server startup error:', {
          message: error.message,
          code: error.code,
          syscall: error.syscall,
          address: error.address,
          port: error.port
        });
        reject(error);
      });

      // Graceful shutdown handler
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