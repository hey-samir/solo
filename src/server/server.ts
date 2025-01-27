import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';

// Debug mode
const debug = process.env.NODE_ENV !== 'production';
console.log('Starting server in debug mode');
console.log('Environment:', process.env.NODE_ENV);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production
    : ['http://localhost:3003', `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

if (debug) {
  console.log('CORS configuration:', corsOptions);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Get the absolute path to the dist directory
const distPath = path.resolve(__dirname, '../../dist');
console.log('Static files path:', distPath);

// Debug middleware
app.use((req, res, next) => {
  if (debug) {
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
  }
  next();
});

// API routes
app.get('/api/health', (_req, res) => {
  if (debug) console.log('Health check endpoint called');
  res.json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// Serve static files with proper MIME types and cache control
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }

    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// SPA fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  if (debug) console.log('SPA route hit:', req.path);
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

try {
  app.listen(PORT, HOST, () => {
    console.log('Server configuration:');
    console.log('- Port:', PORT);
    console.log('- Environment:', process.env.NODE_ENV);
    console.log('- Static path:', distPath);
    console.log(`Server running at http://${HOST}:${PORT}`);

    if (debug) {
      console.log('Replit environment:');
      console.log('- REPL_SLUG:', process.env.REPL_SLUG);
      console.log('- REPLIT_DB_URL:', process.env.REPLIT_DB_URL ? 'Set' : 'Not set');
    }
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

export { app };