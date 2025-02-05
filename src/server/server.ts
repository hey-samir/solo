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

// Port configuration:
// - Production: 3000
// - Staging: 5000
// - Development: 3001
const PORT: number = parseInt(
  process.env.PORT || 
  (isProduction ? '3000' : isStaging ? '5000' : '3001'), 
  10
);

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

// Handle static files and routing based on environment
if (isProduction || isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client');
  console.log(`[${environment}] Server Configuration:`);
  console.log(`- Environment: ${environment}`);
  console.log(`- Port: ${PORT}`);
  console.log(`- Static Path: ${staticPath}`);

  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true });
  }

  // Configure static file serving based on environment
  if (isProduction) {
    // Production: Only serve Coming Soon page
    app.use(express.static(staticPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  } else if (isStaging) {
    // Staging: Serve full application with all features
    app.use(express.static(staticPath, {
      etag: true,
      lastModified: true,
      maxAge: '1h'
    }));

    // Handle SPA routing in staging
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(staticPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        console.error('Error: index.html not found in staging');
        return res.status(500).send('Error loading application');
      }
      res.sendFile(indexPath);
    });
  }
}

// Enhanced error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    path: _req.path
  });
});

// Start server
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

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

export default app;