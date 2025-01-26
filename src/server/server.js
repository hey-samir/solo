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


// Serve static files from the dist directory
var distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

app.use(express.static(distPath, {
    fallthrough: true // Allow falling through to next middleware if file not found
}));

// Debug logging middleware
app.use((req, res, next) => {
    if (debug) {
        console.log(`${req.method} ${req.url}`);
        console.log('Headers:', req.headers);
    }
    next();
});

// API health check
app.get('/api/health', function (_req, res) {
    console.log('Health check endpoint called');
    res.json({ status: 'healthy' });
});

// User routes
app.get('/api/user/:username', function (req, res, next) { 
    res.json({message: "User routes are not yet implemented"})
}); 

// Climbs routes
app.get('/api/climbs', function (_req, res, next) { 
    res.json({message: "Climbs routes are not yet implemented"})
});

// Routes routes
app.get('/api/routes', function (_req, res, next) { 
    res.json({message: "Routes routes are not yet implemented"})
});

// SPA fallback
app.get('*', function (req, res) {
    console.log('Fallback route hit:', req.url);
    res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling
app.use(function (err, _req, res, _next) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

var PORT = Number(process.env.PORT) || 5000;

// Start server with detailed logging
try {
    app.listen(PORT, '0.0.0.0', function () {
        console.log('Server configuration:');
        console.log('- Port:', PORT);
        console.log('- Environment:', process.env.NODE_ENV);
        console.log('- Static path:', distPath);
        console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    }).on('error', function (error) {
        console.error('Server startup error:', error);
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use. Please ensure no other process is using this port.`);
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