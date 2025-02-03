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
const PORT = Number(process.env.PORT || 5000);

// Middleware setup
app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

console.log('Environment:', environment);
console.log('Session Secret Available:', !!process.env.SESSION_SECRET);
console.log('Database URL Available:', !!process.env.DATABASE_URL);

// Add CORS configuration for Replit Webview
const corsOrigins = [
  // Production origin
  ...(isProduction ? ['https://gosolo.nyc'] : []),
  // Staging origins
  ...(isStaging ? ['https://staging.gosolo.nyc'] : []),
  // Development origins
  ...(!isProduction ? ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:5000'] : []),
  // Replit domains (for both staging and development)
  /\.repl\.co$/,
  /\.replit\.dev$/
];

console.log('CORS Origins:', corsOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

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

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api', routes);

if (isProduction || isStaging) {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');


  // Serve static files with proper MIME types
  app.use(express.static(distDir, {
    maxAge: '1d',
    index: false,
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // Serve index.html for client-side routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }

    const indexPath = path.join(distDir, 'index.html');

    if (!fs.existsSync(indexPath)) {
      console.error('index.html not found at:', indexPath);
      res.status(500).send('Building application... Please refresh in a few moments.');
      return;
    }

    res.sendFile(indexPath);
  });
} else {
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3003${req.path}`);
  });
}

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({
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