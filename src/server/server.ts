import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import fs from 'fs';
import { router as featureFlagsRouter } from './routes/feature-flags';

const app = express();
const environment: string = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT: number = parseInt(process.env.PORT || (isStaging ? '5001' : '3000'), 10);

// Basic middleware setup
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://0.0.0.0:3000',
      'http://0.0.0.0:5000',
      ...(process.env.REPL_SLUG ? [
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      ] : [])
    ];
    callback(null, allowedOrigins.includes(origin) || origin?.includes('repl.co') || origin?.includes('replit.dev'));
  },
  credentials: true
}));

// Feature flags endpoint
app.use('/api/features', featureFlagsRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Determine static file path based on environment
const staticPath = path.join(process.cwd(), 'dist');
console.log(`[${environment}] Static files path:`, staticPath);

// Configure static file serving
app.use(express.static(staticPath, {
  maxAge: isProduction ? '1h' : '0',
  etag: true,
  index: false // Don't auto-serve index.html
}));

// SPA fallback route
const spaHandler: RequestHandler = (_req: Request, res: Response, next: NextFunction) => {
  const indexPath = path.join(staticPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error(`Index file not found at ${indexPath}`);
    return res.status(500).send(`Error: index.html not found in ${environment} environment`);
  }

  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
};

app.get('*', spaHandler);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server started in ${environment} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Static files: ${staticPath}`);
    console.log('='.repeat(50));
  });
}

export default app;