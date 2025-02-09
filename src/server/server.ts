import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import type { Request, Response, NextFunction } from 'express';

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
    callback(null, allowedOrigins.includes(origin) || origin?.includes('repl.co'));
  },
  credentials: true
}));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Static file serving based on environment
const staticPath = path.resolve(__dirname, `../../dist/client/${environment}`);
console.log(`[${environment}] Static files path: ${staticPath}`);

// Verify static directory exists
try {
  const fs = require('fs');
  if (!fs.existsSync(staticPath)) {
    console.error(`Error: Static directory not found at ${staticPath}`);
    console.error('Please ensure the build process has completed');
    process.exit(1);
  }

  const files = fs.readdirSync(staticPath);
  console.log('Available files:', files);

  if (!files.includes('index.html')) {
    console.error('Error: index.html not found in static directory');
    process.exit(1);
  }
} catch (error) {
  console.error('Error checking static directory:', error);
  process.exit(1);
}

// Configure static file serving
app.use(express.static(staticPath, {
  maxAge: isProduction ? '1h' : '0',
  etag: true,
  index: 'index.html'
}));

// SPA fallback route
app.get('*', (_req: Request, res: Response) => {
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

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