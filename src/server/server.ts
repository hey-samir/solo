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
const PORT: number = parseInt(process.env.PORT || (isStaging ? '5000' : isProduction ? '80' : '3000'), 10);

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

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

// Serve static files in production/staging
if (isProduction || isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client');

  console.log(`[${environment}] Server Configuration:`);
  console.log(`- Environment: ${environment}`);
  console.log(`- Port: ${PORT}`);
  console.log(`- Static Path: ${staticPath}`);
  console.log(`- Current Directory: ${process.cwd()}`);

  // Verify the static directory exists
  if (!fs.existsSync(staticPath)) {
    console.error(`Error: Static directory not found at ${staticPath}`);
    console.error('Creating static directory...');
    fs.mkdirSync(staticPath, { recursive: true });
  }

  // Serve static files with specific options
  app.use(express.static(staticPath, {
    etag: true,
    lastModified: true,
    maxAge: '1h'
  }));

  // Handle client-side routing
  app.get('*', (_req: Request, res: Response) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('Error: index.html not found');
      return res.status(500).send('Error loading application - Build incomplete');
    }
    res.sendFile(indexPath);
  });
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
  try {
    console.log(`[${environment}] Starting server on port ${PORT}...`);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log(`Server started in ${environment} mode`);
      console.log(`Listening on http://0.0.0.0:${PORT}`);
      console.log(`Process ID: ${process.pid}`);
      console.log(`Node version: ${process.version}`);
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

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

export default app;