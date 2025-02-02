import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import { createClient } from '@vercel/postgres';
import routes from './routes';
import feedbackRoutes from './routes/feedback.routes';
import { db } from './db';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));

// CORS Configuration with credentials
const corsOptions = {
  origin: isProduction 
    ? ['https://gosolo.nyc', 'https://www.gosolo.nyc']
    : [
        'http://localhost:3003',
        `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`,
        'http://localhost:5000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Session configuration with secure settings
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: isProduction ? '.gosolo.nyc' : undefined,
  },
  name: 'solo.sid', // Custom session ID name
  proxy: true // Trust the reverse proxy
}));

// Routes
app.use('/api', routes);
app.use('/api/feedback', feedbackRoutes);

// Get the absolute path to the dist directory
const distPath = path.resolve(__dirname, '../../dist');

// Serve static files with proper MIME types and cache control
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Oops! Something went wrong on our end. Let\'s get you back on track.',
    message: isProduction ? undefined : err.message
  });
});

// Handle all routes for the SPA
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

export { app };