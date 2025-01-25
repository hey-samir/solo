import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS setup with specific origins for better security
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gosolo.nyc', /\.repl\.co$/, /\.replit\.dev$/]
    : true,
  credentials: true
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../../dist');
console.log('Serving static files from:', distPath);

// Serve static files with proper mime types
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// API routes go here (before the catch-all)
app.get('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA catch-all route - must be last
app.get('*', (req, res) => {
  console.log('Serving index.html for path:', req.path);
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log('Application URLs:');
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://0.0.0.0:${PORT}`);
});

export { app };