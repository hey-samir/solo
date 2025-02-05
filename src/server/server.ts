import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import type { Request, Response, NextFunction } from 'express';

const app = express();
const environment: string = process.env.NODE_ENV || 'development';
const isProduction: boolean = environment === 'production';
const isStaging: boolean = environment === 'staging';

// Port configuration based on environment
const PORT: number = parseInt(process.env.PORT || (isStaging ? '5000' : '3000'), 10);

console.log(`Starting server in ${environment} mode on port ${PORT}`);

// Enhanced logging middleware setup
app.use(morgan('dev'));
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  next();
});

// CORS configuration based on environment
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      // Production origins
      'https://gosolo.nyc',
      'https://www.gosolo.nyc',
      'https://1f44956e-bc47-48a8-a13e-c5f6222c2089-00-35jfb2x2btqr5.picard.replit.dev',
      // Staging origins (with port 5000)
      'https://1f44956e-bc47-48a8-a13e-c5f6222c2089-00-35jfb2x2btqr5.picard.replit.dev:5000'
    ];

    if (allowedOrigins.includes(origin)) {
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

// Health check endpoint (available in all environments)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

if (isProduction) {
  // Production directory setup
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

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server started in ${environment} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log('='.repeat(50));
  });
}

export default app;