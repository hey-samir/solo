import { Router } from 'express';
import userRoutes from './user.routes';
import climbRoutes from './climb.routes';
import sessionRoutes from './session.routes';
import routeRoutes from './routes';
import feedbackRoutes from './feedback.routes';
import { db } from '../db';
import { sends, users } from '../db/schema';
import { sql } from 'drizzle-orm';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Add debug middleware for route tracking
router.use((req, _res, next) => {
  console.log('API Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    authenticated: req.isAuthenticated?.(),
    timestamp: new Date().toISOString()
  });
  next();
});

// Leaderboard endpoint
router.get('/leaderboard', async (_req, res) => {
  try {
    console.log('[Leaderboard API] Fetching leaderboard data...');

    const leaderboardQuery = await db.select({
      user_id: users.id,
      username: users.username,
      total_sends: sql<number>`count(case when ${sends.status} = true then 1 end)`.mapWith(Number),
      total_points: sql<number>`sum(${sends.points})`.mapWith(Number)
    })
    .from(users)
    .leftJoin(sends, sql`${sends.user_id} = ${users.id}`)
    .groupBy(users.id, users.username)
    .orderBy(sql`sum(${sends.points}) desc nulls last`);

    // Log raw query results
    console.log('[Leaderboard API] Raw query results:', {
      type: typeof leaderboardQuery,
      isArray: Array.isArray(leaderboardQuery),
      length: leaderboardQuery?.length,
      sample: leaderboardQuery?.[0]
    });

    // Initialize empty array as default response
    let formattedLeaderboard = [];

    // Only process if we have valid array data
    if (Array.isArray(leaderboardQuery) && leaderboardQuery.length > 0) {
      formattedLeaderboard = leaderboardQuery.map(entry => ({
        id: entry.user_id,
        username: entry.username,
        totalSends: entry.total_sends || 0,
        totalPoints: entry.total_points || 0
      }));
    }

    console.log('[Leaderboard API] Formatted response:', {
      count: formattedLeaderboard.length,
      sample: formattedLeaderboard[0]
    });

    return res.json(formattedLeaderboard);
  } catch (error) {
    console.error('[Leaderboard API] Error fetching leaderboard:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mount feature routes
router.use('/users', userRoutes);
router.use('/routes', routeRoutes);
router.use('/climbs', climbRoutes);
router.use('/sessions', sessionRoutes);
router.use('/feedback', feedbackRoutes);

export default router;