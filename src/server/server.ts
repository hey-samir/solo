import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { Pool } from 'pg';
import connectPgSimple from 'connect-pg-simple';
import routes from './routes';
import passport from './middleware/auth';
import * as blueGreenDeployment from './deployment/blue-green';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 3003);

// Debug middleware to log all requests with more details
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Environment:', environment);
  console.log('Port:', PORT);
  if (!isProduction) {
    console.log('Headers:', req.headers);
  }
  next();
});

// Add health check endpoint before any other middleware
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy', 
    environment: process.env.DEPLOYMENT_COLOR || 'blue',
    timestamp: new Date().toISOString()
  });
});

// Middleware setup
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Add CORS configuration
const corsOrigins = [
  ...(isProduction ? ['https://gosolo.nyc'] : []),
  ...(isStaging ? ['https://staging.gosolo.nyc'] : []),
  ...(!isProduction ? [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:5000',
    'http://0.0.0.0:3000',
    'http://0.0.0.0:3003',
    'http://0.0.0.0:5000'
  ] : []),
  /\.repl\.co$/,
  /\.replit\.dev$/,
  /\.repl\.co:\d+$/,
  /\.replit\.dev:\d+$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const isAllowed = corsOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } catch (error) {
      console.error('CORS validation error:', error);
      callback(error instanceof Error ? error : new Error('CORS validation failed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'temporary_staging_secret_key_123',
  resave: false,
  saveUninitialized: false,
  name: 'solo.sid',
  cookie: {
    secure: isProduction || isStaging,
    httpOnly: true,
    sameSite: (isProduction || isStaging ? 'strict' : 'lax') as 'strict' | 'lax' | 'none',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
    createTableIfMissing: true,
    tableName: 'session'
  });
}

app.use(session(sessionConfig));

// Initialize passport after session middleware
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', routes);

// Serve static files in production/staging
if (isProduction || isStaging) {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');

  console.log('Static files directory:', distDir);

  app.use(express.static(distDir, {
    index: false,
    etag: true,
    lastModified: true,
    setHeaders: (res: Response, filePath: string) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));

  // Serve index.html for client-side routing
  app.get('*', (req: Request, res: Response) => {
    const indexPath = path.join(distDir, 'index.html');
    try {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
      }

      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      res.set('Content-Type', 'text/html');
      res.send(indexContent);
    } catch (error) {
      console.error('Error reading index.html:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Error:', {
    message: err.message,
    stack: !isProduction ? err.stack : undefined
  });

  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message
  });
});

// Function to start the server
const startServer = async () => {
  try {
    if (isProduction) {
      const deploymentColor = process.env.DEPLOYMENT_COLOR || 'blue';
      console.log(`Starting ${deploymentColor} environment on port ${PORT}`);
      await blueGreenDeployment.startEnvironment(app, deploymentColor);
      return blueGreenDeployment.getActiveEnvironment().server;
    } else {
      return new Promise((resolve) => {
        const server = app.listen(PORT, '0.0.0.0', () => {
          console.log(`Server running on http://0.0.0.0:${PORT}`);
          console.log('Environment:', environment);
          resolve(server);
        });
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { app, startServer, blueGreenDeployment };