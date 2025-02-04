import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';
import routes from './routes';

const app: Express = express();
const environment: string = process.env.NODE_ENV || 'development';
const isProduction: boolean = environment === 'production';
const isStaging: boolean = environment === 'staging';
const PORT: number = parseInt(process.env.PORT || (isProduction ? '80' : '3000'), 10);

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Add logging

// Import routes
try {
  app.use('/api', routes);
} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

// Health check endpoint (available in all environments)
app.get('/health', (_req: Request, res: Response): void => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files in production/staging
if (isProduction || isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client');

  console.log(`[${environment}] Configuring static files from: ${staticPath}`);
  console.log('Current directory:', process.cwd());
  console.log('__dirname:', __dirname);

  // Verify the static directory exists
  if (!fs.existsSync(staticPath)) {
    console.error(`Error: Static directory not found at ${staticPath}`);
    console.error('Build process may have failed or not been run');
    process.exit(1);
  }

  console.log('Static directory verified successfully');

  // Serve static files with specific options
  app.use(express.static(staticPath, {
    etag: true, // Enable ETag for caching
    lastModified: true,
    maxAge: '1h' // Cache static assets for 1 hour
  }));

  // Handle client-side routing - must come after static file serving
  app.get('*', (_req: Request, res: Response): void => {
    res.sendFile(path.join(staticPath, 'index.html'), (err: Error | null) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
}

// Enhanced error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('[Server Error]:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    path: _req.path
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  try {
    console.log(`[${environment}] Starting server on port ${PORT}...`);
    console.log('Current working directory:', process.cwd());
    console.log('Available files in current directory:');
    console.log(fs.readdirSync('.'));

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

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error('Uncaught Exception:', err);
      server.close(() => {
        console.log('Server closed due to uncaught exception');
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        console.log('Server closed due to unhandled rejection');
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

export default app;
