import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import passport from './middleware/auth';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = Number(process.env.PORT || 5000);

app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());

console.log('Environment:', environment);
console.log('Session Secret Available:', !!process.env.SESSION_SECRET);
console.log('Database URL Available:', !!process.env.DATABASE_URL);

const corsOrigins = (() => {
  if (isProduction) return ['https://gosolo.nyc'];
  if (isStaging) return process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ['https://staging.gosolo.nyc'];
  return ['http://localhost:3003'];
})();

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

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
  console.log('Static files directory structure:');

  try {
    const fs = require('fs');
    const files = fs.readdirSync(distDir);
    console.log('Files in dist:', files);

    if (files.includes('assets')) {
      const assetFiles = fs.readdirSync(path.join(distDir, 'assets'));
      console.log('Files in assets:', assetFiles);
    }
  } catch (err) {
    console.error('Error reading dist directory:', err);
  }

  // Serve static files with caching
  app.use(express.static(distDir, {
    maxAge: '1d',
    index: false,
    etag: true
  }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok',
      environment,
      paths: {
        rootDir,
        distDir,
        indexHtml: path.join(distDir, 'index.html')
      },
      config: {
        corsOrigins,
        hasDb: !!process.env.DATABASE_URL,
        hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        hasSession: true
      }
    });
  });

  // Serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' });
      return;
    }

    const indexPath = path.join(distDir, 'index.html');
    console.log('Serving index.html from:', indexPath);

    try {
      if (!fs.existsSync(indexPath)) {
        throw new Error(`index.html not found at ${indexPath}`);
      }
      res.sendFile(indexPath);
    } catch (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Solo App</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            window.location.reload();
          </script>
        </head>
        <body>
          <p>Loading application...</p>
        </body>
        </html>
      `);
    }
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