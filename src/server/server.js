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

// Allow all origins in development for Replit environment
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(process.cwd(), 'dist'), {
  maxAge: '1h' // Cache static assets for 1 hour
}));

// Simple auth middleware for development
app.use((req, res, next) => {
  req.user = { id: 1, gymId: 1 };
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Basic API endpoints
app.get('/api/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
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

// Serve index.html for all non-API routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});