import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS setup for development
app.use(cors());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../../dist');
console.log('Static files served from:', distPath);

// Serve static files
app.use('/', express.static(distPath, {
  setHeaders: (res, filePath) => {
    // Set correct MIME types
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    // Enable caching for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// API routes go here (before the catch-all)
app.get('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA catch-all route - must be last
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.path);
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

export { app };