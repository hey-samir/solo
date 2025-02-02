import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import passport from './middleware/auth';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Enhanced logging for development
if (!isProduction) {
  console.log('Starting server in development mode...');
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    REPL_ID: process.env.REPL_ID,
    REPL_OWNER: process.env.REPL_OWNER,
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
  });
}

// Add request logging middleware first
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Updated CORS Configuration with credentials
const corsOptions = {
  origin: isProduction 
    ? ['https://gosolo.nyc', 'https://www.gosolo.nyc']
    : [
        'http://localhost:3003',
        'http://0.0.0.0:3003',
        'http://localhost:5000',
        'http://0.0.0.0:5000',
        `http://${process.env.REPL_ID}.id.repl.co`,
        `https://${process.env.REPL_ID}.id.repl.co`,
        `http://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`,
        `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`,
        'http://localhost',
        'http://0.0.0.0'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Session configuration with secure options
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log('[Request Debug]:', {
    method: req.method,
    path: req.path,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    },
    session: req.session?.id,
    user: req.user?.id,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
});

// API Routes - mount under /api prefix
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Server Error]:', {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : err.message,
    details: !isProduction ? err.stack : undefined
  });
});

// Serve static files for SPA
app.use(express.static(path.resolve(__dirname, '../../dist')));

// Handle all routes for the SPA
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS origins:', corsOptions.origin);
});

export { app };