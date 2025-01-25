import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Explicitly set the dist path
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// Verify dist directory exists and show contents
try {
  const files = fs.readdirSync(distPath);
  console.log('Contents of dist directory:', files);
} catch (error) {
  console.error('Error reading dist directory:', error);
}

// First handle API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Static file handling with explicit MIME types
app.use('/', express.static(distPath, {
  index: false, // Disable auto-serving of index.html
  setHeaders: (res, filePath) => {
    console.log('Serving static file:', filePath);
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Catch-all route for SPA
app.get('*', (req, res) => {
  console.log('Serving index.html for path:', req.path);
  const indexPath = path.join(distPath, 'index.html');

  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    console.log('index.html found, serving...');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  } else {
    console.error('index.html not found at:', indexPath);
    res.status(404).send('index.html not found');
  }
});

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

export { app };