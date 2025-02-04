import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import connectPgSimple from 'connect-pg-simple';
import routes from './routes';
import passport from './middleware/auth';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';

// Ensure PORT is always set and defaults to 80 for production
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;
const HOST = '0.0.0.0';

// Debug middleware to log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Configure middleware
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? ['https://gosolo.nyc']
    : [`http://${HOST}:${PORT}`, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'development_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
};

if (isProduction) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required in production');
  }

  const PostgreSQLStore = connectPgSimple(session);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  sessionConfig.store = new PostgreSQLStore({
    pool,
    createTableIfMissing: true
  });
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', routes);

// Serve static files in production
if (isProduction) {
  const clientDir = path.join(__dirname, '../../client');
  console.log('Serving static files from:', clientDir);

  app.use(express.static(clientDir));

  // Handle client-side routing
  app.get('*', (req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT} (${environment} mode)`);
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      SESSION_SECRET: process.env.SESSION_SECRET ? 'Set' : 'Not set'
    });
  });
}

export default app;