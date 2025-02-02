import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, sends, routes } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get user stats
router.get('/me/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[Stats API] Request received:', {
      userId: req.user?.id,
      session: req.session?.id,
      isAuthenticated: req.isAuthenticated?.()
    });

    if (!req.user?.id) {
      console.log('[Stats API] Unauthorized access attempt');
      return res.status(401).json({ error: 'Please log in to view statistics' });
    }

    const stats = await db.select({
      totalAscents: sql<number>`count(*)`.mapWith(Number),
      totalSends: sql<number>`sum(case when ${sends.status} = true then 1 else 0 end)`.mapWith(Number),
      totalPoints: sql<number>`sum(${sends.points})`.mapWith(Number),
      avgGrade: sql<string>`mode() within group (order by ${routes.grade})`.mapWith(String),
      avgSentGrade: sql<string>`mode() within group (order by case when ${sends.status} = true then ${routes.grade} end)`.mapWith(String),
      avgPointsPerClimb: sql<number>`round(avg(${sends.points})::numeric, 1)`.mapWith(Number),
      successRate: sql<number>`round(sum(case when ${sends.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number),
      successRatePerSession: sql<number>`round(avg(case when ${sends.status} = true then 100 else 0 end)::numeric, 1)`.mapWith(Number),
      climbsPerSession: sql<number>`round(count(*)::numeric / count(distinct date_trunc('day', ${sends.created_at}))::numeric, 1)`.mapWith(Number),
      avgAttemptsPerClimb: sql<number>`round(avg(${sends.tries})::numeric, 1)`.mapWith(Number)
    })
    .from(sends)
    .leftJoin(routes, eq(sends.route_id, routes.id))
    .where(eq(sends.user_id, req.user.id));

    console.log('[Stats API] Returning stats for user:', req.user.id);
    res.json(stats[0]);
  } catch (error) {
    console.error('[Stats API] Error fetching stats:', error);
    res.status(500).json({ 
      error: "Failed to fetch statistics",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;