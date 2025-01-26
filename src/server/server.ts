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
    ? ['http://localhost:3002', 'https://solo.nyc', /.+\.replit\.dev$/, /.+\.repl\.co$/]
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

// Use a different port if the default is busy
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const HOST = '0.0.0.0';

// Add error handling for already in use port
const server = app.listen(PORT, HOST)
  .on('error', (error: any) => {
    console.error('Server startup error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Trying alternative port...`);
      // Try alternative port
      app.listen(5001, HOST, () => {
        console.log(`Server running on alternative port 5001`);
      });
    }
  })
  .on('listening', () => {
    console.log(`Server running on http://${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    if (debug) {
      console.log('Server configuration:');
      console.log('- Port:', PORT);
      console.log('- Environment:', process.env.NODE_ENV);
      console.log('- Static path:', distPath);
    }
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app };