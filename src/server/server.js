const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();

// Enhanced logging middleware
const logRequest = (req, _, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    next();
};

// Enhanced middleware setup
app.use(logRequest);
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Configure static file serving
const distPath = path.resolve(process.cwd(), 'dist');
console.log('Static files directory:', distPath);

// Verify dist directory exists
if (!fs.existsSync(distPath)) {
    console.error(`Error: dist directory not found at ${distPath}`);
    process.exit(1);
}

// Health check endpoint with detailed response
app.get('/api/health', (_, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        distPath
    });
});

// Serve static files with proper headers
app.use(express.static(distPath, {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Set appropriate content types
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
}));

// Client-side routing - serve index.html for all non-asset routes
app.get('*', (req, res) => {
    // Skip API routes
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }

    console.log(`Serving index.html for path: ${req.url}`);
    const indexPath = path.join(distPath, 'index.html');

    // Verify index.html exists
    if (!fs.existsSync(indexPath)) {
        console.error('Error: index.html not found in dist directory');
        return res.status(500).send('Application files not found');
    }

    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('Error loading application');
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

// Start server with enhanced error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Serving static files from: ${distPath}`);
}).on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});