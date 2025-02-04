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
// - Production: 80
// - Staging: 5000
// - Development: 3000
const PORT: number = parseInt(
  process.env.PORT || 
  (isStaging ? '5000' : isProduction ? '80' : '3000'), 
  10
);

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Import routes
try {
  const routes = require('./routes');
  app.use('/api', routes);
} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

// Health check endpoint with environment info
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    server_type: isProduction ? 'production' : isStaging ? 'staging' : 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// Handle static files based on environment
if (isProduction || isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client');

  console.log(`[${environment}] Server Configuration:`);
  console.log(`- Environment: ${environment}`);
  console.log(`- Port: ${PORT}`);
  console.log(`- Static Path: ${staticPath}`);
  console.log(`- Current Directory: ${process.cwd()}`);

  // Verify the static directory exists and create if needed
  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true });
  }

  // Environment-specific static file serving
  if (isProduction) {
    // In production, only serve the Coming Soon page
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  } else {
    // In staging, serve all static files normally
    app.use(express.static(staticPath, {
      etag: true,
      lastModified: true,
      maxAge: '1h'
    }));

    // Handle client-side routing for non-static requests
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(staticPath, 'index.html'));
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

// Only start the server if this file is run directly
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