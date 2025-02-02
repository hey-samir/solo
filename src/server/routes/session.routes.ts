import { Router, Request, Response } from 'express';
import { db } from '../db';
import { climbs, routes, User } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Get all sessions
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Please log in to view sessions' });
    }

    // Get sessions by grouping climbs by date
    const sessions = await db
      .select({
        date: sql<string>`date_trunc('day', ${climbs.created_at})::date`.mapWith(String),
        total_climbs: sql<number>`count(*)`.mapWith(Number),
        total_sends: sql<number>`sum(case when ${climbs.status} = true then 1 else 0 end)`.mapWith(Number),
        total_points: sql<number>`sum(${climbs.points})`.mapWith(Number),
        avg_grade: sql<string>`mode() within group (order by ${routes.grade})`.mapWith(String),
        duration: sql<number>`extract(epoch from (max(${climbs.created_at}) - min(${climbs.created_at})))/3600`.mapWith(Number),
        grades: sql<string[]>`array_agg(distinct ${routes.grade} order by ${routes.grade})`.mapWith(String),
        success_rate: sql<number>`round(sum(case when ${climbs.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number)
      })
      .from(climbs)
      .leftJoin(routes, eq(climbs.route_id, routes.id))
      .where(eq(climbs.user_id, req.user.id))
      .groupBy(sql`date_trunc('day', ${climbs.created_at})::date`)
      .orderBy(sql`date_trunc('day', ${climbs.created_at})::date desc`);

    const formattedSessions = sessions.map(session => ({
      id: session.date, // Using date as session ID
      userId: req.user?.id,
      duration: Math.round(session.duration || 0), // Convert to hours
      location: 'Main Gym', // Default location
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
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific session
router.get('/:date', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Please log in to view session details' });
    }

    const { date } = req.params;

    // Get session details for specific date
    const [session] = await db
      .select({
        date: sql<string>`date_trunc('day', ${climbs.created_at})::date`.mapWith(String),
        total_climbs: sql<number>`count(*)`.mapWith(Number),
        total_sends: sql<number>`sum(case when ${climbs.status} = true then 1 else 0 end)`.mapWith(Number),
        total_points: sql<number>`sum(${climbs.points})`.mapWith(Number),
        avg_grade: sql<string>`mode() within group (order by ${routes.grade})`.mapWith(String),
        duration: sql<number>`extract(epoch from (max(${climbs.created_at}) - min(${climbs.created_at})))/3600`.mapWith(Number),
        grades: sql<string[]>`array_agg(distinct ${routes.grade} order by ${routes.grade})`.mapWith(String),
        success_rate: sql<number>`round(sum(case when ${climbs.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number)
      })
      .from(climbs)
      .leftJoin(routes, eq(climbs.route_id, routes.id))
      .where(
        sql`${climbs.user_id} = ${req.user.id} AND date_trunc('day', ${climbs.created_at})::date = ${date}::date`
      )
      .groupBy(sql`date_trunc('day', ${climbs.created_at})::date`);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const formattedSession = {
      id: session.date,
      userId: req.user.id,
      duration: Math.round(session.duration || 0),
      location: 'Main Gym',
      totalClimbs: session.total_climbs,
      totalSends: session.total_sends,
      totalPoints: session.total_points,
      avgGrade: session.avg_grade,
      grades: session.grades,
      successRate: session.success_rate,
      createdAt: session.date
    };

    res.json(formattedSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ 
      error: 'Failed to fetch session details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;