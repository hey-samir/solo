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

// Determine environment and template
const env = process.env.NODE_ENV || 'development';
const templateName = env === 'staging' ? 'staging.html' : 'index.html';
const clientDir = path.join(__dirname, '../../dist', env);

console.log('[Server] Environment configuration:', {
  env,
  clientDir,
  templateName,
  exists: require('fs').existsSync(clientDir),
  pwd: process.cwd(),
  dirname: __dirname
});

// Check build exists
if (!require('fs').existsSync(clientDir)) {
  const message = `[Server] Error: client directory not found: ${clientDir}`;
  console.error(message);
  console.error('[Server] Please run build first');
  console.error('[Server] Current directory structure:');
  try {
    const fs = require('fs');
    const distDir = path.join(__dirname, '../../dist');
    if (fs.existsSync(distDir)) {
      console.error('Available directories in dist:');
      console.error(fs.readdirSync(distDir));
    } else {
      console.error('dist directory does not exist');
    }
  } catch (err) {
    console.error('Error checking directory structure:', err);
  }
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: env,
    timestamp: new Date().toISOString(),
    clientDir: {
      path: clientDir,
      exists: require('fs').existsSync(clientDir),
      template: path.join(clientDir, templateName)
    }
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
  res.sendFile(path.join(clientDir, templateName));
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

if (require.main === module) {
  const port = env === 'staging' ? 5000 : 3000;

  app.listen(port, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`[Server] Successfully started ${env} server on port ${port}`);
    console.log(`[Server] Server URL: http://0.0.0.0:${port}`);
    console.log(`[Server] Environment: ${env}`);
    console.log('='.repeat(50));
  });
}

module.exports = app;