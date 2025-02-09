import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import type { Request, Response, NextFunction } from 'express';

const app = express();
const environment: string = process.env.NODE_ENV || 'development';
const isProduction: boolean = environment === 'production';
const isStaging: boolean = environment === 'staging';
const PORT: number = parseInt(process.env.PORT || (isStaging ? '5001' : '3000'), 10);

// Enhanced logging
console.log('='.repeat(50));
console.log(`Starting server in ${environment} mode`);
console.log(`Server port: ${PORT}`);
console.log(`Process ID: ${process.pid}`);
console.log('='.repeat(50));

// Basic middleware setup with enhanced logging
app.use(morgan('dev'));
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5000',
      'http://0.0.0.0:5000',
      ...(process.env.REPL_SLUG ? [
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`,
        `https://${process.env.REPL_SLUG}-5000.${process.env.REPL_OWNER}.repl.co`
      ] : [])
    ];

    if (allowedOrigins.includes(origin) || origin.includes('repl.co')) {
      console.log(`Allowed CORS for origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`Rejected CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString(),
    port: PORT,
    pid: process.pid
  });
});

// Production directory setup
if (isProduction) {
  const productionDir = path.resolve(__dirname, '../../dist/client/production');
  console.log('Production directory:', productionDir);

  // Serve static files with proper caching headers
  app.use(express.static(productionDir, {
    maxAge: '1h',
    etag: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        // Don't cache HTML files
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  // Production SPA fallback
  app.get('*', (_req: Request, res: Response) => {
    const htmlFile = path.join(productionDir, 'production.html');
    console.log(`[Production] Attempting to serve: ${htmlFile}`);
    res.sendFile(htmlFile, (err) => {
      if (err) {
        console.error(`[Production] Error serving ${htmlFile}:`, err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Staging directory setup
if (isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client/staging');
  console.log('Staging directory:', staticPath);

  app.use(express.static(staticPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));

  // Staging SPA fallback
  app.get('*', (_req: Request, res: Response) => {
    const htmlPath = path.join(staticPath, 'index.html');
    console.log(`[Staging] Attempting to serve: ${htmlPath}`);
    res.sendFile(htmlPath, (err) => {
      if (err) {
        console.error(`[Staging] Error serving ${htmlPath}:`, err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Enhanced error handler with detailed logging
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Server Error:`, {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });

  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp,
    path: req.path
  });
});

// Start server with enhanced error handling
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server started successfully in ${environment} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Node version: ${process.version}`);
    console.log('='.repeat(50));
  }).on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

export default app;