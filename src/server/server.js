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

// Configure static file serving with appropriate caching
const staticOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '0' : 0, // Disable caching temporarily
  etag: false, // Disable ETags to prevent caching
  lastModified: false // Disable Last-Modified to prevent caching
};

// Serve static files with cache busting
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, '../../dist'), staticOptions));

// Import and use feature flags router
const { router: featureFlagsRouter } = require('./routes/feature-flags');
app.use('/api/feature-flags', featureFlagsRouter);

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Function to start server with strict port validation
async function startServer() {
  try {
    // Strictly enforce environment-specific ports
    const env = process.env.NODE_ENV || 'production';
    const port = env === 'production' ? 3000 : 5000;

    console.log(`[Server] Starting ${env} server on port ${port}...`);

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
        console.log(`[Server] Successfully started ${env} server on port ${port}`);
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