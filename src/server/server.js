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
const cors = require('cors');
const morgan = require('morgan');

console.log('[Server] Express and utilities imported successfully');

// Create app
const app = express();

// Logging middleware
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('.replit.dev') || origin.includes('0.0.0.0')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Enhanced request logging
app.use((req, res, next) => {
  console.log('[Server] Incoming request:', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
  next();
});

// Determine correct dist path based on environment
const env = process.env.NODE_ENV || 'development';
const clientDir = path.join(__dirname, '../../dist', env);

console.log('[Server] Environment configuration:', {
  env,
  clientDir,
  exists: require('fs').existsSync(clientDir)
});

// Check build exists
if (!require('fs').existsSync(clientDir)) {
  console.error('[Server] Error: client directory not found:', clientDir);
  console.error('[Server] Please run build first');
  process.exit(1);
}

// Disable caching for development and staging
if (env !== 'production') {
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });
}

// Import API Routes
let featureFlagsRouter;
try {
  const { router } = require('./routes/feature-flags');
  featureFlagsRouter = router;
  console.log('[Server] Feature flags router imported successfully');
} catch (error) {
  console.error('[Server] Error importing feature flags router:', error);
  process.exit(1);
}

const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const feedbackRouter = require('./routes/feedback');

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/stats', statsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/feature-flags', featureFlagsRouter);
app.use('/api/standings', authRouter); // Add direct standings route

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: env,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the client directory
app.use(express.static(clientDir, {
  maxAge: env === 'production' ? '1d' : 0,
  etag: env === 'production',
  lastModified: env === 'production'
}));

// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Function to start server
async function startServer() {
  try {
    const port = env === 'staging' ? 5000 : 3000;

    console.log(`[Server] Starting ${env} server on port ${port}...`);

    return new Promise((resolve, reject) => {
      const server = app.listen(port, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`[Server] Successfully started ${env} server on port ${port}`);
        console.log(`[Server] Server URL: http://0.0.0.0:${port}`);
        console.log(`[Server] Environment: ${env}`);
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
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;