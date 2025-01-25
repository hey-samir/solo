import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import passport from './middleware/auth';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const distPath = path.resolve(process.cwd(), 'dist');

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    const allowedDomains = [
      'https://gosolo.nyc',
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /^https?:\/\/localhost/
    ];

    const isAllowed = allowedDomains.some(domain => 
      typeof domain === 'string' ? domain === origin : domain.test(origin)
    );
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/auth', authRoutes);

// Basic health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files with proper error handling
app.use(express.static(distPath, {
  fallthrough: true // Allow falling through to next middleware if file not found
}));

// SPA fallback
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server only if this file is being run directly
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  }).on('error', (error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { app };