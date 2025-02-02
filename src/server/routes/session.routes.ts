import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sends, routes } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get all sessions
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[Sessions API] Request received:', {
      userId: req.user?.id,
      session: req.session?.id,
      isAuthenticated: req.isAuthenticated?.()
    });

    if (!req.user?.id) {
      console.log('[Sessions API] Unauthorized access attempt');
      return res.status(401).json({ error: 'Please log in to view sessions' });
    }

    // Get sessions by grouping sends by date
    const sessions = await db
      .select({
        date: sql<string>`date_trunc('day', ${sends.created_at})::date`.mapWith(String),
        total_climbs: sql<number>`count(*)`.mapWith(Number),
        total_sends: sql<number>`sum(case when ${sends.status} = true then 1 else 0 end)`.mapWith(Number),
        total_points: sql<number>`sum(${sends.points})`.mapWith(Number),
        avg_grade: sql<string>`mode() within group (order by ${routes.grade})`.mapWith(String),
        duration: sql<number>`extract(epoch from (max(${sends.created_at}) - min(${sends.created_at})))/3600`.mapWith(Number),
        grades: sql<string[]>`array_agg(distinct ${routes.grade} order by ${routes.grade})`.mapWith(String),
        success_rate: sql<number>`round(sum(case when ${sends.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number)
      })
      .from(sends)
      .leftJoin(routes, eq(sends.route_id, routes.id))
      .where(eq(sends.user_id, req.user.id))
      .groupBy(sql`date_trunc('day', ${sends.created_at})::date`)
      .orderBy(sql`date_trunc('day', ${sends.created_at})::date desc`);

    console.log('[Sessions API] Retrieved sessions:', {
      count: sessions.length,
      sample: sessions.slice(0, 2)
    });

    const formattedSessions = sessions.map(session => ({
      id: session.date,
      userId: req.user?.id,
      duration: Math.round(session.duration || 0),
      location: 'Main Gym',
      totalClimbs: session.total_climbs,
      totalSends: session.total_sends,
      totalPoints: session.total_points,
      avgGrade: session.avg_grade,
      grades: session.grades,
      successRate: session.success_rate,
      createdAt: session.date
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('[Sessions API] Error fetching sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;