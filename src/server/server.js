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
var corsOptions = {
    origin: function (origin, callback) {
        console.log('Incoming request origin:', origin);
        if (!origin || process.env.NODE_ENV === 'development') {
            callback(null, true);
            return;
        }
        var allowedDomains = [
            'https://gosolo.nyc',
            /\.repl\.co$/,
            /\.replit\.dev$/,
            /^https?:\/\/localhost/,
        ];
        var isAllowed = allowedDomains.some(function (domain) { 
            return typeof domain === 'string' ? domain === origin : domain.test(origin); 
        });
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

if (debug) {
    console.log('CORS configuration:', corsOptions);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Session configuration
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

app.get('/api/user/:username', (req, res) => { 
    res.json({message: "User routes are not yet implemented"});
}); 

app.get('/api/climbs', (_req, res) => { 
    res.json({message: "Climbs routes are not yet implemented"});
});

app.get('/api/routes', (_req, res) => { 
    res.json({message: "Routes routes are not yet implemented"});
});

// Serve static files with proper MIME types
app.use(express.static(distPath, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        }
    }
}));

// Handle all other routes for SPA
app.get('*', (req, res) => {
    if (debug) {
        console.log('SPA route hit:', req.path);
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
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

try {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('Server configuration:');
        console.log('- Port:', PORT);
        console.log('- Environment:', process.env.NODE_ENV);
        console.log('- Static path:', distPath);
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    }).on('error', (error) => {
        console.error('Server startup error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use`);
            process.exit(1);
        } else {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
} catch (error) {
    console.error('Critical server error:', error);
    process.exit(1);
}