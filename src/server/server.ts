import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const distPath = path.resolve(process.cwd(), 'dist');
const assetsPath = path.resolve(process.cwd(), 'attached_assets');

// CORS Configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    const allowedDomains = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /^https?:\/\/localhost/,
      /^http?:\/\/localhost/
    ];
    const isAllowed = allowedDomains.some(domain => domain.test(origin));
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

console.log('Setting up static file serving from:', distPath);
console.log('Setting up assets serving from:', assetsPath);

// Serve attached_assets directory with proper caching
app.use('/attached_assets', express.static(assetsPath, {
  maxAge: '1y',
  index: false,
  setHeaders: (res: Response, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for images
    }
  }
}));

// Serve static files from dist with proper MIME types and caching
app.use(express.static(distPath, {
  index: false,
  setHeaders: (res: Response, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.js' || ext === '.css' || ['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for assets
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// API routes here
app.get('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA fallback - Always serve index.html for client-side routing
app.get('*', (req: Request, res: Response) => {
  console.log(`Handling request for: ${req.url}`);
  const indexPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found at:', indexPath);
    return res.status(404).send('Application files not found. Please build the project first.');
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

export { app, server };