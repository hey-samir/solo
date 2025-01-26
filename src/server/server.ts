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
    ? ['http://localhost:3003', 'http://0.0.0.0:3003', 'https://solo.nyc', /.+\.replit\.dev$/, /.+\.repl\.co$/]
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
  fallthrough: true,
  setHeaders: (res, filePath) => {
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

const PORT = 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  if (debug) {
    console.log('Server configuration:');
    console.log('- Port:', PORT);
    console.log('- Environment:', process.env.NODE_ENV);
    console.log('- Static path:', distPath);
  }
});

export { app };