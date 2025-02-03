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

  console.log('Root directory:', rootDir);
  console.log('Dist directory:', distDir);

  // Verify build output
  try {
    if (!fs.existsSync(distDir)) {
      console.error('Dist directory not found at:', distDir);
      process.exit(1);
    }

    const distContents = fs.readdirSync(distDir);
    console.log('Contents of dist directory:', distContents);

    const assetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const assetsContents = fs.readdirSync(assetsDir);
      console.log('Contents of assets directory:', assetsContents);
    }

    const indexPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('index.html not found at:', indexPath);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error verifying build output:', error);
    process.exit(1);
  }

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
      res.status(500).send('Error loading application. Please try again.');
    }
  });
} else {
  // Development mode: redirect all requests to development server
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
  });
}

export { app };