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

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = isProduction ? 80 : Number(process.env.PORT || 5000);

// Debug middleware to log all requests with more details
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (!isProduction) {
    console.log('Headers:', req.headers);
  }
  next();
});

// Middleware setup
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

// Add CORS configuration
const corsOrigins = [
  // Production origin
  ...(isProduction ? ['https://gosolo.nyc'] : []),
  // Staging origins
  ...(isStaging ? ['https://staging.gosolo.nyc'] : []),
  // Development origins
  ...(!isProduction ? [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:5000'
  ] : []),
  // Replit domains (for both staging and development)
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
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } catch (error) {
      console.error('CORS validation error:', error);
      callback(error);
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

if (isProduction || isStaging) {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');

  // Serve static files
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

// Only start the server if this file is run directly
if (require.main === module) {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log('Environment:', environment);
      console.log('API Routes mounted at /api');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

export { app };