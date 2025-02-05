import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';
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
app.use(morgan('dev')); // Add logging

// Import routes
try {
  const routes = require('./routes');
  app.use('/api', routes);
} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

// Health check endpoint (available in all environments)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Production: Serve static coming soon page
if (isProduction) {
  const productionHtml = path.resolve(__dirname, '../../production.html');

  console.log(`[${environment}] Production mode: Serving coming soon page`);

  // Serve all routes with the production HTML
  app.get('*', (req: Request, res: Response) => {
    if (!fs.existsSync(productionHtml)) {
      console.error('Error: production.html not found at', productionHtml);
      return res.status(500).send('Error loading application');
    }
    res.sendFile(productionHtml);
  });
}

// Staging: Serve the full application
if (isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client/staging');
  console.log(`[${environment}] Serving static files from: ${staticPath}`);

  // Configure static file serving
  app.use(express.static(staticPath, {
    etag: true,
    lastModified: true,
    maxAge: '1h'
  }));

  // SPA routing
  app.get('*', (req: Request, res: Response) => {
    const indexPath = path.join(staticPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      console.error('Error: index.html not found at', indexPath);
      return res.status(500).send('Error loading application');
    }

    res.sendFile(indexPath);
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

// Only start server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server started in ${environment} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Current directory: ${process.cwd()}`);
    console.log('='.repeat(50));
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