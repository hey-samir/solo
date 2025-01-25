import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import compression from 'compression';
import fs from 'fs';

dotenv.config();

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Static files setup with absolute path
const distPath = path.resolve(process.cwd(), 'dist');
console.log('Static files directory:', distPath);

// Function to check if build is complete
function isBuildComplete(): boolean {
  try {
    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.log('index.html not found');
      return false;
    }
    const assetsDir = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsDir)) {
      console.log('assets directory not found');
      return false;
    }
    const dirContents = fs.readdirSync(assetsDir);
    const hasMainJs = dirContents.some(file => file.includes('main') && file.endsWith('.js'));
    console.log('Assets directory contents:', dirContents);
    console.log('Main JS bundle found:', hasMainJs);
    return hasMainJs;
  } catch (error) {
    console.error('Error checking build completion:', error);
    return false;
  }
}

// Function to wait for build completion
async function waitForBuild(maxAttempts: number = 30, interval: number = 1000): Promise<boolean> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    console.log(`Checking for build completion (attempt ${attempts + 1}/${maxAttempts})...`);

    if (isBuildComplete()) {
      console.log('Build files found! Dist contents:', fs.readdirSync(distPath));
      const assetsDir = path.join(distPath, 'assets');
      console.log('Assets directory contents:', fs.readdirSync(assetsDir));
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  console.error('Build files not found after maximum attempts');
  return false;
}

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distPath, { recursive: true });
} else {
  console.log('Dist directory exists, contents:', fs.readdirSync(distPath));
}

// Configure static file serving with proper MIME types
app.use(express.static(distPath, {
  index: false, // Don't automatically serve index.html for SPA routing
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res: Response, filePath: string) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
    // Ensure proper CORS and caching headers for all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Handle SPA routes - serve index.html for all non-API routes
app.get('*', async (req: Request, res: Response) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  console.log('Serving index.html for path:', req.path);

  // Wait for build to complete if necessary
  if (!isBuildComplete()) {
    console.log('Build not complete, waiting...');
    const buildReady = await waitForBuild();
    if (!buildReady) {
      return res.status(503).send('Application is building. Please refresh in a moment...');
    }
  }

  const indexPath = path.join(distPath, 'index.html');

  try {
    // Verify the file exists and is readable
    await fs.promises.access(indexPath, fs.constants.R_OK);
    console.log('Successfully verified access to index.html');
    res.sendFile(indexPath, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error accessing index.html:', error);
    res.status(503).send('Application is still initializing. Please refresh in a moment...');
  }
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = Number(process.env.PORT || 5000);

// Only start the server after checking build status
console.log('Waiting for build to complete before starting server...');
waitForBuild().then((buildReady) => {
  if (buildReady) {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
      console.log(`Static files being served from: ${distPath}`);
    });
  } else {
    console.error('Failed to start server: Build files not found');
    process.exit(1);
  }
});

export { app };