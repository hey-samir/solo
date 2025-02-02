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
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set'
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
        'http://localhost:5000',
        'http://0.0.0.0:3003',
        'http://0.0.0.0:5000',
        `https://${process.env.REPL_ID}.id.repl.co`,
        `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`,
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Session configuration with secure settings
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

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Add debug middleware for all requests
app.use((req, res, next) => {
  console.log('Request Debug:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    cookies: req.cookies,
    session: req.session?.id,
    user: req.user?.id,
    origin: req.headers.origin
  });
  next();
});

// API Routes with /api prefix
app.use('/api', routes);

// Serve static files
const distPath = path.resolve(__dirname, '../../dist');
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    error: 'Internal server error',
    message: isProduction ? 'Something went wrong' : err.message
  });
});

// Handle all routes for the SPA
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS origins:', corsOptions.origin);
});

export { app };