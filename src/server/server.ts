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
  origin: isProduction ? 'https://gosolo.nyc' : 'http://localhost:3003',
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

// Handle static files and client routing
if (isProduction) {
  // Use relative path resolution from current directory
  const distPath = path.join(__dirname, '..', '..');
  console.log('Static files path:', distPath);

  // Serve static files with caching headers
  app.use(express.static(path.join(distPath), {
    maxAge: '1d',
    index: false
  }));

  // For all other routes, serve index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
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
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Current directory:', __dirname);
    console.log('Dist path:', path.join(__dirname, '..', '..'));
  });
}

export { app };