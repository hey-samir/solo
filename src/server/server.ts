import express from 'express';
import cors from 'cors';
import path from 'path';

// Add debug logging
const debug = process.env.NODE_ENV !== 'production';
if (debug) {
  console.log('Starting server in debug mode');
  console.log('Environment:', process.env.NODE_ENV);
}

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration - Handle Replit domains
const corsOptions = process.env.NODE_ENV === 'production' 
  ? { 
      origin: true, // Allow all origins in production
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  : {
      origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
          console.log('Incoming request origin:', origin);
          if (!origin) {
              callback(null, true);
              return;
          }
          const allowedDomains = [
              'https://gosolo.nyc',
              /\.repl\.co$/,
              /\.replit\.dev$/,
              /-\d{2}-[a-z0-9]+\..*\.replit\.dev$/, // Match Replit dev URLs
              process.env.REPL_SLUG ? new RegExp(`${process.env.REPL_SLUG}.*\\.replit\\.dev$`) : null,
          ].filter(Boolean);

          const isAllowed = allowedDomains.some(domain => { 
              return typeof domain === 'string' ? domain === origin : domain.test(origin); 
          });

          if (debug) {
              console.log('Checking origin:', origin);
              console.log('Allowed?', isAllowed);
          }

          callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

if (debug) {
    console.log('CORS configuration:', corsOptions);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Get the absolute path to the dist directory
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// Add debug middleware
app.use((req, res, next) => {
    if (debug) {
        console.log(`${req.method} ${req.path}`);
        console.log('Headers:', req.headers);
    }
    next();
});

// API routes
app.get('/api/health', (_req, res) => {
    if (debug) console.log('Health check endpoint called');
    res.json({ status: 'healthy' });
});

// Serve static files with explicit MIME types and caching headers
app.use(express.static(distPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Set appropriate MIME types
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }

        // Set caching headers
        if (filePath.includes('/assets/')) {
            // Cache assets for 1 year
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        } else {
            // Don't cache HTML files
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// SPA fallback - Must be after static files middleware
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }

    if (debug) console.log('SPA route hit:', req.path);
    res.sendFile(path.join(distPath, 'index.html'), err => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error loading application');
        }
    });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('Server configuration:');
    console.log('- Port:', PORT);
    console.log('- Environment:', process.env.NODE_ENV);
    console.log('- Static path:', distPath);
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);

    if (debug) {
        console.log('Replit environment:');
        console.log('- REPL_SLUG:', process.env.REPL_SLUG);
        console.log('- REPLIT_DB_URL:', process.env.REPLIT_DB_URL ? 'Set' : 'Not set');
    }
});

export { app };