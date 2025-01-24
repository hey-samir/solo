import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import compression from 'compression';
import { users, routes, climbs } from './db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import fs from 'fs'; // Import fs module

dotenv.config();

// Initialize express app
const app = express();

// Database setup
let db: PostgresJsDatabase;
try {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const client = postgres(process.env.DATABASE_URL, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
    max_lifetime: 60 * 30 // 30 minutes
  });

  db = drizzle(client);
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

// Enable compression for all responses
app.use(compression());

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parse JSON requests
app.use(express.json({ limit: '10mb' }));

// Serve static files and handle client-side routing
const distPath = path.join(process.cwd(), 'dist');
console.log('Static files will be served from:', distPath);

// Serve static files with aggressive caching for assets
app.use(
  express.static(distPath, {
    maxAge: '1h',
    etag: true,
    lastModified: true,
    index: false // Disable auto-serving of index.html
  })
);

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    mode: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// User routes
app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user || user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user[0].id,
      username: user[0].username,
      profilePhoto: user[0].profilePhoto,
      memberSince: user[0].memberSince,
      gymId: user[0].gymId
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Stats
app.get('/api/user/:userId/stats', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
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
app.get('/api/routes', async (req: Request<{}, {}, {}, { gymId?: string }>, res: Response): Promise<void> => {
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
app.get('/api/climbs', async (req: Request<{}, {}, {}, { userId?: string }>, res: Response): Promise<void> => {
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
app.get('/api/standings', async (_req: Request, res: Response): Promise<void> => {
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

// Catch-all route for client-side routing
app.get('/*', (req: Request, res: Response) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not Found' });
  }

  // Check if the requested path exists as a static file
  const filePath = path.join(distPath, req.path);
  if (req.path !== '/' && fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }

  // Otherwise serve index.html for client-side routing
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Error</title></head>
          <body>
            <h1>Application Error</h1>
            <p>The application failed to load. Please try again later.</p>
          </body>
        </html>
      `);
    }
  });
});

// Helper functions for stats calculations
function calculateAverageGrade(climbs: any[]): string {
  if (!climbs.length) return '--';
  // Implementation depends on your grade system
  return 'V4'; // Placeholder
}

function calculateSuccessRatePerSession(climbs: any[]): number {
  if (!climbs.length) return 0;
  // Group by session and calculate success rate
  return 75; // Placeholder
}

function calculateClimbsPerSession(climbs: any[]): number {
  if (!climbs.length) return 0;
  // Group by session and calculate average
  return 8; // Placeholder
}

function calculateAverageAttempts(climbs: any[]): number {
  if (!climbs.length) return 0;
  return climbs.reduce((sum, c) => sum + (c.tries || 1), 0) / climbs.length;
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;

// Start server with explicit host binding
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { db };