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

// Basic middleware
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? ['https://gosolo.nyc']
    : [
        'http://localhost:3003',
        'http://localhost:5000',
        'http://0.0.0.0:3003',
        'http://0.0.0.0:5000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Debug logging middleware
app.use((req, res, next) => {
  console.log('[Request]:', {
    method: req.method,
    url: req.url,
    path: req.path,
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      cookie: req.headers.cookie ? 'present' : 'none'
    }
  });
  next();
});

// Session configuration
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

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Server Error]:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : err.message,
    details: !isProduction ? err.stack : undefined
  });
});

// Serve static files
app.use(express.static(path.resolve(__dirname, '../../dist')));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS origins:', corsOptions.origin);
});

export { app };