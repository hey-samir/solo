const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');

console.log('Starting server initialization...');
console.log('Node environment:', process.env.NODE_ENV);

// Initialize express app
const app = express();

// Database setup with connection pooling optimized for concurrent users
let db;
try {
    console.log('Connecting to database...');
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is required');
    }
    const client = postgres(process.env.DATABASE_URL, {
        max: 20, // Maximum number of connections
        idle_timeout: 30, // Close idle connections after 30 seconds
        connect_timeout: 10, // Connection timeout after 10 seconds
    });
    db = drizzle(client);
    console.log('Database connection successful');
} catch (error) {
    console.error('Database connection failed:', error);
    // Don't exit, allow server to start without DB for static file serving
    console.log('Continuing without database connection...');
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configure static file serving
const distPath = path.join(process.cwd(), 'dist');
console.log('Static files directory:', distPath);

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
    console.error('Warning: dist directory does not exist. Running in development mode.');
} else {
    app.use(express.static(distPath, {
        maxAge: '1h',
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            } else if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
        }
    }));
}

// Simple auth middleware for development
app.use((req, _, next) => {
    // Add a mock user for development
    req.user = {
        id: 1,
        gymId: 1
    };
    next();
});

// Health check endpoint
app.get('/api/health', (_, res) => {
    res.json({ status: 'healthy', dbConnected: !!db });
});

// Mock endpoints for development
app.get('/api/user/me/stats', (_, res) => {
    res.json({
        totalAscents: 25,
        totalSends: 20,
        totalPoints: 1000,
        avgGrade: 'V5'
    });
});

app.get('/api/climbs', (_, res) => {
    res.json([{
        id: 1,
        routeId: 1,
        status: true,
        rating: 4,
        tries: 2,
        notes: "Great route!",
        points: 100,
        createdAt: new Date().toISOString(),
        route: {
            color: "Blue",
            grade: "V4"
        }
    }]);
});

app.get('/api/routes', (_, res) => {
    res.json([{
        id: 1,
        routeId: "R001",
        color: "Blue",
        grade: "V4",
        rating: 4,
        dateSet: new Date().toISOString()
    }]);
});

app.get('/api/leaderboard', (_, res) => {
    res.json([{
        username: "testuser",
        totalAscents: 25,
        totalPoints: 1000
    }]);
});

// Skip API routes in catch-all handler
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(500).send('Application files not found');
        }
    } else {
        res.redirect('http://localhost:3000');
    }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

exports.db = db;