import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import routes from './routes';
import passport from './middleware/auth';
import blueGreenDeployment from './deployment/blue-green';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isProduction ? 80 : 5000);

// Debug middleware to log all requests with more details
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (!isProduction) {
    console.log('Headers:', req.headers);
  }
  next();
});

// Add health check endpoint before any other middleware
app.get('/health', (req, res) => {
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
    'http://localhost:5000'
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
      const originWithoutProtocol = origin.replace(/^https?:\/\//, '');
      const baseOrigin = originWithoutProtocol.split(':')[0];

      const isAllowed = corsOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        const error = new Error('Not allowed by CORS');
        console.log('Blocked by CORS:', origin);
        callback(error);
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
  cookie: {
    secure: isProduction || isStaging,
    httpOnly: true,
    sameSite: (isProduction || isStaging ? 'strict' : 'lax') as 'strict' | 'lax' | 'none',
    maxAge: 24 * 60 * 60 * 1000
  }
};

if (isProduction) {
  const PostgreSQLStore = require('connect-pg-simple')(session);
  sessionConfig.store = new PostgreSQLStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  });
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', routes);

// Serve static files in production/staging
if (isProduction || isStaging) {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');

  // Serve static files with caching
  app.use(express.static(distDir, {
    index: false,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
      // Cache assets for 1 year
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));

  // Handle all other routes by serving index.html
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }

    const indexPath = path.join(distDir, 'index.html');
    try {
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
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', {
    message: err.message,
    stack: !isProduction ? err.stack : undefined
  });

  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message
  });
});

// Update the startServer function to support blue-green deployment
const startServer = async () => {
  try {
    console.log('Starting server with configuration:');
    console.log('Environment:', environment);

    if (isProduction) {
      // In production, use blue-green deployment
      const deploymentColor = process.env.DEPLOYMENT_COLOR || 'blue';
      console.log(`Starting ${deploymentColor} environment`);

      await blueGreenDeployment.startEnvironment(app, deploymentColor as 'blue' | 'green');

      return blueGreenDeployment.getActiveEnvironment().server;
    } else {
      // In development/staging, use regular deployment
      const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (isStaging ? 5000 : 3003);

      const server = await new Promise((resolve, reject) => {
        const server = app.listen(PORT, '0.0.0.0', () => {
          console.log(`Server running on http://0.0.0.0:${PORT}`);
          console.log('Environment:', environment);
          console.log('API Routes mounted at /api');
          resolve(server);
        });

        server.on('error', (error: Error) => {
          console.error('Server failed to start:', error);
          reject(error);
        });
      });

      return server;
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export the app and startServer function
export { app, startServer, blueGreenDeployment };

// Only start the server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}