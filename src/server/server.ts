import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import passport from './middleware/auth';
import { Pool } from 'pg';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = Number(process.env.PORT || 5000);

// Set up session secret with fallback for development
const sessionSecret = process.env.SESSION_SECRET || 'temporary_development_secret_key_123';

// CORS configuration
const corsOrigins = (() => {
  if (isProduction) return ['https://gosolo.nyc'];
  if (isStaging) return process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ['https://staging.gosolo.nyc'];
  return ['http://localhost:3003'];
})();

// Basic middleware setup
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Session setup
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction || isStaging ? { rejectUnauthorized: false } : false
});

const PostgresqlStore = pgSession(session);
app.use(session({
  store: new PostgresqlStore({
    pool: sessionPool,
    tableName: 'user_sessions'
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction || isStaging,
    httpOnly: true,
    sameSite: isProduction || isStaging ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API middleware
const authCheckMiddleware: express.RequestHandler = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    res.status(503).json({ 
      error: 'Authentication service unavailable',
      details: isProduction ? undefined : 'Missing OAuth configuration'
    });
    return;
  }
  next();
};

// Routes setup
app.use('/api', authCheckMiddleware, routes);

// Static file serving for production/staging
if (isProduction || isStaging) {
  const distPath = path.resolve(__dirname, '..', '..');

  app.use(express.static(path.join(distPath, 'dist'), {
    maxAge: '1d',
    index: false,
    etag: true
  }));

  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok',
      environment,
      config: {
        corsOrigins,
        hasDb: !!process.env.DATABASE_URL,
        hasSession: true, // We now have a session secret (either from env or fallback)
        hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      }
    });
  });

  // Serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.sendFile(path.join(distPath, 'dist', 'index.html'));
    }
  });
} else {
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3003${req.path}`);
  });
}

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
    details: !isProduction ? err.stack : undefined
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Environment:', environment);
    console.log('CORS Origins:', corsOrigins);
  });
}

export { app };