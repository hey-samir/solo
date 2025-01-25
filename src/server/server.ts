import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const distPath = path.resolve(process.cwd(), 'dist');
const assetsPath = path.resolve(process.cwd(), 'attached_assets');

// Basic health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

console.log('Setting up static file serving from:', distPath);
console.log('Setting up assets serving from:', assetsPath);

// Serve attached_assets directory
app.use('/attached_assets', express.static(assetsPath, {
  index: false,
  setHeaders: (res: Response, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for images
    }
  }
}));

// Serve static files with proper MIME types
app.use(express.static(distPath, {
  index: false, // Don't serve index.html automatically
  setHeaders: (res: Response, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    // Set cache control for static assets
    if (ext === '.js' || ext === '.css' || ['png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// SPA fallback - Always serve index.html for client-side routing
app.get('*', (req: Request, res: Response) => {
  console.log(`Handling request for: ${req.url}`);

  // Skip API routes
  if (req.url.startsWith('/api/')) {
    console.log('API route not found:', req.url);
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  const indexPath = path.join(distPath, 'index.html');
  console.log('Attempting to serve index.html from:', indexPath);

  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found at:', indexPath);
    return res.status(404).send('Application files not found. Please build the project first.');
  }

  // Send index.html for client-side routing
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    } else {
      console.log('Successfully served index.html');
    }
  });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  console.log('Static files directory:', distPath);
  console.log('Assets directory:', assetsPath);

  try {
    const files = fs.readdirSync(distPath);
    console.log('Available files:', files);

    const assetFiles = fs.readdirSync(assetsPath);
    console.log('Assets directory contents:', assetFiles);
  } catch (error) {
    console.error('Error reading directories:', error);
  }
});

export { app, server };