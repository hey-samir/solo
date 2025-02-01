var express = require('express');
var cors = require('cors');
var dotenv = require('dotenv');
var path = require('path');
var session = require('express-session');

// Debug mode
const debug = process.env.NODE_ENV !== 'production';
console.log('Starting server in debug mode');
console.log('Environment:', process.env.NODE_ENV);

dotenv.config();

// Initialize express app
var app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = process.env.NODE_ENV === 'production' 
  ? { 
      origin: ['https://gosolo.nyc'], // Only allow gosolo.nyc in production
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  : {
      origin: ['http://localhost:3003', `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };

if (debug) {
    console.log('CORS configuration:', corsOptions);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Session configuration - Use secure cookies in production
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Get the absolute path to the dist directory
const distPath = path.resolve(__dirname, '../../dist');
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
app.get('*', (req, res) => {
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
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;

// Start server
try {
    const server = app.listen(PORT, '0.0.0.0', () => {
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

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });

} catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
}