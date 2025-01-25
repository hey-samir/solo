import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import compression from 'compression';

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Basic middleware setup
app.use(morgan('dev')); // Logging
app.use(compression()); // Compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', /\.repl\.co$/, /\.replit\.dev$/]
    : ['https://gosolo.nyc', /\.repl\.co$/, /\.replit\.dev$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with proper error handling
if (require.main === module) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    } else {
      console.error('Server failed to start:', error);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

export { app };