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
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 5000);

// Basic middleware
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in development and production
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

// Serve static files and handle client routing
if (isProduction) {
  // Production: serve from dist
  const distPath = path.join(__dirname, '../../../dist');
  app.use(express.static(distPath, {
    index: false, // Don't serve index.html for all routes
    maxAge: '1d' // Cache static assets for 1 day
  }));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development: redirect to dev server
  app.get('/', (_req, res) => {
    res.redirect('http://localhost:3003');
  });

  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3003${req.path}`);
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
  });
}

export { app };