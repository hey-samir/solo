import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const distPath = path.resolve(process.cwd(), 'dist');
const assetsPath = path.resolve(process.cwd(), 'attached_assets');

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Always allow in development mode
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // Production allowed domains
    const allowedDomains = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /^https?:\/\/localhost/
    ];

    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = allowedDomains.some(domain => domain.test(origin));
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files and handle SPA routing
app.use(express.static(distPath));
app.use('/attached_assets', express.static(assetsPath));

// SPA fallback
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server only if this file is being run directly
if (require.main === module) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  }).on('error', (error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

export { app };