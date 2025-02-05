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

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

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
    etag: true
  }));

  // Production SPA fallback
  app.get('*', (_req: Request, res: Response) => {
    const htmlFile = path.join(productionDir, 'src', 'production.html');
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
  app.use(express.static(staticPath));

  // Staging SPA fallback
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Enhanced error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
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