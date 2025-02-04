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
import { deployment } from './deployment/blue-green';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 3003);

// Debug middleware to log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Environment:', environment);
  console.log('Port:', PORT);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    environment
  });
});

// Configure middleware
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// CORS configuration
const corsOrigins = [
  ...(isProduction ? ['https://gosolo.nyc'] : []),
  ...(!isProduction ? ['http://localhost:3000', 'http://localhost:3003', 'http://0.0.0.0:3000', 'http://0.0.0.0:80'] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'development_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: 'lax',
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

// API Routes
app.use('/api', routes);

// Serve static files in production
if (isProduction) {
  const clientDir = path.resolve(__dirname, '../client');
  console.log('Static files directory:', clientDir);

  app.use(express.static(clientDir, {
    maxAge: '1y',
    etag: true
  }));

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
  res.status(500).json({ error: isProduction ? 'Internal Server Error' : err.message });
});

const startServer = async () => {
  try {
    if (isProduction) {
      console.log(`Starting server in production mode on port ${PORT}`);
      const server = await deployment.startEnvironment(app, 'blue');
      return server;
    } else {
      return app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export { app, deployment as blueGreenDeployment };