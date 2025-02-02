import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes';
import passport from './middleware/auth';
import { Pool } from 'pg';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = Number(process.env.PORT || 5000);

// CORS configuration
const corsOrigins = (() => {
  if (isProduction) return ['https://gosolo.nyc'];
  if (isStaging) return process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : ['https://staging.gosolo.nyc'];
  return ['http://localhost:3003'];
})();

function validateConfig() {
  const requiredEnvVars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'SESSION_SECRET': process.env.SESSION_SECRET,
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required configuration: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    return { valid: false, error: errorMessage };
  }

  return { valid: true };
}

console.log('Environment Variables Status:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
  SESSION_SECRET: process.env.SESSION_SECRET ? '[SET]' : '[NOT SET]',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '[SET]' : '[NOT SET]',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '[SET]' : '[NOT SET]',
  CORS_ORIGIN: process.env.CORS_ORIGIN
});

const configValidation = validateConfig();

// Setup error handler for configuration issues
if (!configValidation.valid) {
  app.get('*', (_req, res) => {
    res.status(500).json({
      error: 'Application configuration error',
      details: isProduction ? undefined : configValidation.error,
      environment
    });
  });
} else {
  // Standard middleware setup
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(cookieParser());

  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }));

  try {
    const PostgresqlStore = pgSession(session);
    const sessionPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction || isStaging ? { rejectUnauthorized: false } : false
    });

    sessionPool.query('SELECT NOW()', (err) => {
      if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
      } else {
        console.log('Database connection successful');
      }
    });

    app.use(session({
      store: new PostgresqlStore({
        pool: sessionPool,
        tableName: 'user_sessions'
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction || isStaging,
        httpOnly: true,
        sameSite: isProduction || isStaging ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
      }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api', routes);

    if (isProduction || isStaging) {
      const distPath = path.resolve(__dirname, '..', '..');

      app.use(express.static(path.join(distPath, 'dist'), {
        maxAge: '1d',
        index: false,
        etag: true
      }));

      app.get('/health', (_req, res) => {
        res.json({
          status: 'ok',
          environment,
          config: {
            corsOrigins,
            hasDb: !!process.env.DATABASE_URL,
            hasSession: !!process.env.SESSION_SECRET,
            hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
          }
        });
      });

      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
          res.status(404).json({ error: 'API endpoint not found' });
        } else {
          res.sendFile(path.join(distPath, 'dist', 'index.html'));
        }
      });
    } else {
      app.get('*', (req, res) => {
        res.redirect(`http://localhost:3003${req.path}`);
      });
    }

    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Server Error:', err);
      res.status(err.status || 500).json({
        error: isProduction ? 'Internal Server Error' : err.message,
        details: !isProduction ? err.stack : undefined
      });
    });

  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('Environment:', environment);
    console.log('CORS Origins:', corsOrigins);
  });
}

export { app };