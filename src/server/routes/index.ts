import { Router } from 'express';
import userRoutes from './user.routes';
import climbRoutes from './climb.routes';
import sessionRoutes from './session.routes';
import routeRoutes from './routes';
import feedbackRoutes from './feedback.routes';
import authRoutes from './auth';
import { db } from '../db';
import { sends, users } from '../db/schema';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount feature routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/routes', routeRoutes);
router.use('/climbs', climbRoutes);
router.use('/sessions', sessionRoutes);
router.use('/feedback', feedbackRoutes);

// Leaderboard endpoint
router.get('/leaderboard', async (req, res) => {
  try {
    const results = await db
      .select({
        user_id: users.id,
        username: users.username,
        total_sends: sql<number>`COALESCE(count(case when ${sends.status} = true then 1 end), 0)`.mapWith(Number),
        total_points: sql<number>`COALESCE(sum(${sends.points}), 0)`.mapWith(Number)
      })
      .from(users)
      .leftJoin(sends, sql`${sends.user_id} = ${users.id}`)
      .groupBy(users.id, users.username)
      .orderBy(sql`COALESCE(sum(${sends.points}), 0) desc`);

    const leaderboardData = results.map((entry) => ({
      id: entry.user_id,
      username: entry.username || 'Unknown User',
      totalSends: Number(entry.total_sends) || 0,
      totalPoints: Number(entry.total_points) || 0
    }));

    return res.json(leaderboardData);
  } catch (error) {
    console.error('[Leaderboard API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;