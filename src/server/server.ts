import express from 'express';
import cors from 'cors';
import path from 'path';

// Add debug logging
const debug = process.env.NODE_ENV !== 'production';
if (debug) {
  console.log('Starting server in debug mode');
  console.log('Environment:', process.env.NODE_ENV);
}

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to allow requests from development server
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'https://solo.nyc', /.+\.replit\.dev$/, /.+\.repl\.co$/]
    : true,
  credentials: true
};

if (debug) {
  console.log('CORS configuration:', corsOptions);
}

app.use(cors(corsOptions));

// Explicitly set the dist path
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// First handle API routes
app.get('/api/health', (_req, res) => {
  if (debug) console.log('Health check endpoint called');
  res.json({ status: 'healthy' });
});

// Static file handling with explicit MIME types
app.use(express.static(distPath, {
  fallthrough: true, // Allow falling through to next middleware if file not found
  setHeaders: (res, filePath) => {
    // Set appropriate cache headers
    if (filePath.includes('assets')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Add logging middleware
app.use((req, res, next) => {
  if (debug) {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
  }
  next();
});

// SPA fallback
app.get('*', (req, res) => {
  if (debug) console.log('Fallback route hit:', req.url);
  res.sendFile(path.join(distPath, 'index.html'));
});

// Primary and fallback ports configuration
const PRIMARY_PORT = 5000;
const FALLBACK_PORT = 5001;
const HOST = '0.0.0.0';

function startServer(port: number) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, HOST)
      .on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is already in use, will try fallback`);
          reject(error);
        } else {
          console.error('Server error:', error);
          reject(error);
        }
      })
      .on('listening', () => {
        console.log(`Server running on http://${HOST}:${port} in ${process.env.NODE_ENV || 'development'} mode`);
        if (debug) {
          console.log('Server configuration:');
          console.log('- Port:', port);
          console.log('- Environment:', process.env.NODE_ENV);
          console.log('- Static path:', distPath);
        }
        resolve(server);
      });
  });
}

// Try primary port first, then fallback
startServer(PRIMARY_PORT).catch(() => {
  console.log(`Trying fallback port ${FALLBACK_PORT}`);
  startServer(FALLBACK_PORT).catch((error) => {
    console.error('Failed to start server on both ports:', error);
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

export { app };