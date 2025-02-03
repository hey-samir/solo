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

app.use('/api', routes);

if (isProduction || isStaging) {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');

  console.log('Root directory:', rootDir);
  console.log('Dist directory:', distDir);

  app.use(express.static(distDir, {
    maxAge: '1d',
    index: false,
    etag: true
  }));

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

  app.get('*', (req, res) => {
    try {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
        return;
      }

      const indexPath = path.join(distDir, 'index.html');
      console.log('Attempting to serve index.html from:', indexPath);

      if (!require('fs').existsSync(indexPath)) {
        console.error('index.html not found at:', indexPath);
        throw new Error(`index.html not found at ${indexPath}`);
      }

      res.sendFile(indexPath);
    } catch (err) {
      const error = err as Error;
      console.error('Error serving static file:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: !isProduction ? error.message : undefined,
        paths: !isProduction ? {
          attempted: path.join(distDir, 'index.html'),
          exists: require('fs').existsSync(distDir)
        } : undefined
      });
    }
  });
} else {
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3003${req.path}`);
  });
}

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