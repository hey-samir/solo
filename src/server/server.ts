import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import compression from 'compression';
import { users, routes, climbs, feedback, feedbackVotes, routeGrades, gyms } from './db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import fs from 'fs';

dotenv.config();

// Initialize express app
const app = express();

// Database setup
let db: PostgresJsDatabase;
try {
  console.log('Connecting to database...');
  const client = postgres(process.env.DATABASE_URL!, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
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
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const distPath = path.join(projectRoot, 'dist');

// Check dist directory only once at startup
const distReady = (() => {
  const exists = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
  console.log(`Dist directory status: ${exists ? 'ready' : 'not ready'}`);
  return exists;
})();

// Serve static files if dist is ready
if (distReady) {
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true,
    index: false
  }));
}

// API Routes
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({ 
    status: 'healthy',
    mode: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// User routes
type UserParams = { username: string };
app.get<UserParams>('/api/user/:username', async (req: Request<UserParams>, res: Response): Promise<void> => {
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
type RoutesQuery = { gymId?: string };
app.get<{}, {}, {}, RoutesQuery>('/api/routes', async (req: Request<{}, {}, {}, RoutesQuery>, res: Response): Promise<void> => {
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
type ClimbsQuery = { userId?: string };
app.get<{}, {}, {}, ClimbsQuery>('/api/climbs', async (req: Request<{}, {}, {}, ClimbsQuery>, res: Response): Promise<void> => {
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

// Feedback routes
app.get('/api/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const sort = req.query.sort === 'top' ? 'votes' : 'new';

    const feedbackItems = sort === 'votes' 
      ? await db
          .select()
          .from(feedback)
          .leftJoin(feedbackVotes, eq(feedback.id, feedbackVotes.feedbackId))
          .groupBy(feedback.id)
          .orderBy(desc(sql`COUNT(${feedbackVotes.id})`))
      : await db
          .select()
          .from(feedback)
          .orderBy(desc(feedback.createdAt));

    res.json(feedbackItems);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// SPA fallback - handle all non-API routes
app.get('*', (req: Request, res: Response): void => {
  // Skip API routes
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }

  if (!distReady) {
    res.status(503).send(
      'Application is building. Please try again in a moment.'
    );
    return;
  }

  res.sendFile(path.join(distPath, 'index.html'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    lastModified: true,
    etag: true,
    headers: {
      'Cache-Control': process.env.NODE_ENV === 'production' ? 'public, max-age=31536000' : 'no-cache'
    }
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { db };