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

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

console.log('CORS Origins:', corsOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      // Remove protocol and potential port
      const originWithoutProtocol = origin.replace(/^https?:\/\//, '');
      const baseOrigin = originWithoutProtocol.split(':')[0];

      const isAllowed = corsOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        // For exact string matches, compare with the full origin
        return allowedOrigin === origin;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        console.log('Base origin:', baseOrigin);
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

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// API Routes - Must come before the catch-all route
app.use('/api', routes);

if (isProduction || isStaging) {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');

  console.log('Root directory:', rootDir);
  console.log('Dist directory:', distDir);

  // Serve static files
  app.use(express.static(distDir, {
    index: false, // Don't serve index.html automatically
    etag: true, // Enable caching
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set correct content types
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      }
      // Enable caching for static assets
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
      }
    }
  }));

  // Handle all other routes by serving index.html
  app.get('*', (req, res) => {
    // Don't handle API routes
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }

    const indexPath = path.join(distDir, 'index.html');
    console.log('Attempting to serve index.html from:', indexPath);

    try {
      // Read and serve index.html
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      res.set('Content-Type', 'text/html');
      res.send(indexContent);
    } catch (error) {
      console.error('Error reading index.html:', error);
      // Send a more user-friendly error message
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Solo App</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              div {
                text-align: center;
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 { color: #333; margin-bottom: 1rem; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <div>
              <h1>Loading Solo App</h1>
              <p>Please wait while we set up the application...</p>
            </div>
          </body>
        </html>
      `);
    }
  });
} else {
  // Development mode: Handle API and client routes properly
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      // Let the API routes handle this
      return;
    }

    console.log('Development mode: Serving index.html for client route:', req.path);
    res.sendFile(path.join(__dirname, '../../index.html'));
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
    console.log('API Routes mounted at /api');
  });
}

export { app };