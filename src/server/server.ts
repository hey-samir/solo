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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 3003);

// Debug middleware to log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
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
    : ['http://localhost:3000', 'http://0.0.0.0:3000'],
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

// API Routes - all API routes should be prefixed with /api
app.use('/api', routes);

// Development specific middleware
if (!isProduction) {
  // In development, proxy requests to the Vite dev server
  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    // Proxy to Vite dev server
    res.redirect(`http://localhost:3000${req.url}`);
  });
} else {
  // Serve static files in production
  const clientDir = path.resolve(__dirname, '../client');

  app.use(express.static(clientDir, {
    maxAge: '1y',
    etag: true
  }));

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

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${environment} mode)`);
  });
}

export default app;