import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import compression from 'compression';
import { users, routes, climbs } from './db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import fs from 'fs';

dotenv.config();

const app = express();

// Database setup
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Static files setup with absolute path
const distPath = path.resolve(process.cwd(), 'dist');
console.log('Static files directory:', distPath);

// Verify dist directory contents
if (fs.existsSync(distPath)) {
  console.log('Dist directory contents:', fs.readdirSync(distPath));
  console.log('Assets directory contents:', fs.readdirSync(path.join(distPath, 'assets')));
} else {
  console.error('Dist directory not found at:', distPath);
}

// Serve static files with proper MIME types
app.use(express.static(distPath, {
  index: false, // Don't serve index.html automatically
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set proper content type for JavaScript files
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    // Set CORS headers for all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/user/:username', async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.username, req.params.username)).limit(1);
    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Stats
app.get('/api/user/:userId/stats', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userClimbs = await db.select().from(climbs).where(eq(climbs.userId, userId));

    const stats = {
      totalAscents: userClimbs.length,
      totalSends: userClimbs.filter(c => c.status === true).length,
      totalPoints: userClimbs.reduce((sum, c) => sum + (c.points || 0), 0),
      avgGrade: calculateAverageGrade(userClimbs),
      avgSentGrade: calculateAverageGrade(userClimbs.filter(c => c.status === true)),
      avgPointsPerClimb: userClimbs.length ?
        userClimbs.reduce((sum, c) => sum + (c.points || 0), 0) / userClimbs.length : 0,
      successRate: userClimbs.length ?
        (userClimbs.filter(c => c.status === true).length / userClimbs.length) * 100 : 0,
      successRatePerSession: calculateSuccessRatePerSession(userClimbs),
      climbsPerSession: calculateClimbsPerSession(userClimbs),
      avgAttemptsPerClimb: calculateAverageAttempts(userClimbs)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes routes
app.get('/api/routes', async (req, res) => {
  try {
    const gymId = req.query.gymId;
    if (!gymId) {
      res.json([]);
      return;
    }

    const gymRoutes = await db.select()
      .from(routes)
      .where(eq(routes.gymId, Number(gymId)));

    res.json(gymRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Climbs routes
app.get('/api/climbs', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const userClimbs = await db.select()
      .from(climbs)
      .where(eq(climbs.userId, Number(userId)))
      .orderBy(desc(climbs.createdAt));

    res.json(userClimbs);
  } catch (error) {
    console.error('Error fetching climbs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Standings route
app.get('/api/standings', async (_req, res) => {
  try {
    const standings = await db
      .select({
        userId: users.id,
        username: users.username,
        totalPoints: sql<number>`SUM(COALESCE(${climbs.points}, 0))`,
        totalAscents: sql<number>`COUNT(${climbs.id})`
      })
      .from(users)
      .leftJoin(climbs, eq(users.id, climbs.userId))
      .groupBy(users.id, users.username)
      .orderBy(desc(sql`SUM(COALESCE(${climbs.points}, 0))`));

    res.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Log request details
  console.log('Serving index.html for path:', req.path);

  const indexPath = path.join(distPath, 'index.html');

  if (fs.existsSync(indexPath)) {
    console.log('Found index.html at:', indexPath);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  } else {
    console.error('index.html not found at:', indexPath);
    res.status(500).send('Application error: index.html not found');
  }
});

// Error handler with detailed logging
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = Number(process.env.PORT || 5000);
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Static files being served from: ${distPath}`);
});

export { db };

function calculateAverageGrade(climbs: any[]): number {
  //Implementation for calculateAverageGrade
  return 0;
}

function calculateSuccessRatePerSession(climbs: any[]): number {
  //Implementation for calculateSuccessRatePerSession
  return 0;
}

function calculateClimbsPerSession(climbs: any[]): number {
  //Implementation for calculateClimbsPerSession
  return 0;
}

function calculateAverageAttempts(climbs: any[]): number {
  //Implementation for calculateAverageAttempts
  return 0;
}