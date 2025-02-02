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

// Basic middleware
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// CORS configuration
const corsOrigins = (() => {
  if (isProduction) return ['https://gosolo.nyc'];
  if (isStaging) return process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ['https://staging.gosolo.nyc'];
  return ['http://localhost:3003'];
})();

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// PostgreSQL session store setup
const PostgresqlStore = pgSession(session);
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Session configuration with PostgreSQL store
app.use(session({
  store: new PostgresqlStore({
    pool: sessionPool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction || isStaging,
    httpOnly: true,
    sameSite: isProduction || isStaging ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', routes);

// Handle static files and client routing
if (isProduction || isStaging) {
  // Use absolute path resolution
  const distPath = path.resolve(__dirname, '..', '..');
  console.log('Static files path:', distPath);
  console.log('Environment:', environment);

  // Serve static files with caching headers
  app.use(express.static(path.join(distPath, 'dist'), {
    maxAge: '1d',
    index: false
  }));

  // For all other routes, serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'dist', 'index.html'));
  });
} else {
  // Development: redirect to dev server
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3003${req.path}`);
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: environment === 'development' ? err.stack : undefined
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Environment:', environment);
    console.log('Current directory:', __dirname);
    console.log('Dist path:', path.resolve(__dirname, '..', '..'));
  });
}

export { app };