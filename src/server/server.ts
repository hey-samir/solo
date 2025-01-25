import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import compression from 'compression';

// Load environment variables
dotenv.config();

const app = express();

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
  console.log('Static files path:', distPath);

  // Serve static files with caching headers
  app.use(express.static(distPath, {
    maxAge: '1h',
    etag: true,
    lastModified: true
  }));

  // SPA fallback - ensure this comes after static file serving
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

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (error: NodeJS.ErrnoException) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

export { app };