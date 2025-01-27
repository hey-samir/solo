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

// CORS Configuration - Handle Replit domains
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('Incoming request origin:', origin);
    if (!origin) {
      callback(null, true);
      return;
    }
    const allowedDomains = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /-\d{2}-[a-z0-9]+\..*\.replit\.dev$/,
      process.env.REPL_SLUG ? new RegExp(`${process.env.REPL_SLUG}.*\\.replit\\.dev$`) : null,
    ].filter(Boolean);

    const isAllowed = allowedDomains.some(domain => {
      return typeof domain === 'string' ? domain === origin : domain.test(origin);
    });

    if (debug) {
      console.log('Checking origin:', origin);
      console.log('Allowed?', isAllowed);
    }

    callback(null, true); // Allow all origins during development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Get the absolute path to the dist directory
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// Add debug middleware
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
  res.json({ status: 'healthy' });
});

// Serve static files
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return;
  }
  if (debug) console.log('SPA route hit:', req.path);
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

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

export { app };