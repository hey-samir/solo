const express = require('express');
const cors = require('cors');
const path = require('path');
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');

const app = express();

// Database setup with connection pooling optimized for concurrent users
let db;
try {
  console.log('Connecting to database...');
  const client = postgres(process.env.DATABASE_URL, {
    max: 20, // Maximum number of connections
    idle_timeout: 30, // Close idle connections after 30 seconds
    connect_timeout: 10, // Connection timeout after 10 seconds
  });
  db = drizzle(client);
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

// CORS configuration based on environment
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Serve static files with caching and proper MIME types
const distPath = path.join(process.cwd(), 'dist');
console.log('Static directory path:', distPath);

app.use(express.static(distPath, {
  maxAge: '1h', // Cache static assets for 1 hour
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Simple auth middleware for development
app.use((req, res, next) => {
  req.user = { id: 1, gymId: 1 };
  next();
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// User endpoint with proper error handling
app.get('/api/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    if (username === 'me') {
      // Handle current user case
      return res.json({
        id: req.user.id,
        username: 'testuser',
        profilePhoto: null,
        memberSince: new Date().toISOString(),
        gymId: req.user.gymId
      });
    }

    const users = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.username, username),
      limit: 1
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      profilePhoto: user.profilePhoto,
      memberSince: user.memberSince,
      gymId: user.gymId
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock endpoints for development
app.get('/api/user/me/stats', (req, res) => {
  res.json({
    totalAscents: 25,
    totalSends: 20,
    totalPoints: 1000,
    avgGrade: 'V5'
  });
});

app.get('/api/climbs', (req, res) => {
  res.json([
    {
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
    }
  ]);
});

app.get('/api/routes', (req, res) => {
  res.json([
    {
      id: 1,
      routeId: "R001",
      color: "Blue",
      grade: "V4",
      rating: 4,
      dateSet: new Date().toISOString()
    }
  ]);
});

app.get('/api/leaderboard', (req, res) => {
  res.json([
    {
      username: "testuser",
      totalAscents: 25,
      totalPoints: 1000
    }
  ]);
});

// Serve index.html for all non-API routes to support client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  console.log('Serving index.html for path:', req.path);
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});