import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, climbs, routes, User } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: User;
}

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
      totalSends: sql<number>`sum(case when ${climbs.status} = true then 1 else 0 end)`.mapWith(Number),
      totalPoints: sql<number>`sum(${climbs.points})`.mapWith(Number),
      avgGrade: sql<string>`mode() within group (order by ${routes.grade})`.mapWith(String),
      avgSentGrade: sql<string>`mode() within group (order by case when ${climbs.status} = true then ${routes.grade} end)`.mapWith(String),
      avgPointsPerClimb: sql<number>`round(avg(${climbs.points})::numeric, 1)`.mapWith(Number),
      successRate: sql<number>`round(sum(case when ${climbs.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number),
      successRatePerSession: sql<number>`round(avg(case when ${climbs.status} = true then 100 else 0 end)::numeric, 1)`.mapWith(Number),
      climbsPerSession: sql<number>`round(count(*)::numeric / count(distinct date_trunc('day', ${climbs.created_at}))::numeric, 1)`.mapWith(Number),
      avgAttemptsPerClimb: sql<number>`round(avg(${climbs.tries})::numeric, 1)`.mapWith(Number)
    })
    .from(climbs)
    .leftJoin(routes, eq(climbs.route_id, routes.id))
    .where(eq(climbs.user_id, req.user.id));

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

// Get user stats charts data
router.get('/me/stats/charts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('[Charts API] Request received:', {
      userId: req.user?.id,
      session: req.session?.id,
      isAuthenticated: req.isAuthenticated?.()
    });

    if (!req.user?.id) {
      console.log('[Charts API] Unauthorized access attempt');
      return res.status(401).json({ error: 'Please log in to view statistics' });
    }

    // Get ascents by difficulty
    const ascentsByDifficulty = await db
      .select({
        grade: routes.grade,
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(climbs)
      .leftJoin(routes, eq(climbs.route_id, routes.id))
      .where(eq(climbs.user_id, req.user.id))
      .groupBy(routes.grade)
      .orderBy(routes.grade);

    // Get sends by date
    const sendsByDate = await db
      .select({
        date: sql<string>`date_trunc('day', ${climbs.created_at})::date`.mapWith(String),
        sends: sql<number>`sum(case when ${climbs.status} = true then 1 else 0 end)`.mapWith(Number),
        attempts: sql<number>`sum(case when ${climbs.status} = false then 1 else 0 end)`.mapWith(Number)
      })
      .from(climbs)
      .where(eq(climbs.user_id, req.user.id))
      .groupBy(sql`date_trunc('day', ${climbs.created_at})::date`)
      .orderBy(sql`date_trunc('day', ${climbs.created_at})::date`);

    // Calculate send rate over time
    const sendRate = await db
      .select({
        date: sql<string>`date_trunc('day', ${climbs.created_at})::date`.mapWith(String),
        rate: sql<number>`round(sum(case when ${climbs.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number)
      })
      .from(climbs)
      .where(eq(climbs.user_id, req.user.id))
      .groupBy(sql`date_trunc('day', ${climbs.created_at})::date`)
      .orderBy(sql`date_trunc('day', ${climbs.created_at})::date`);

    // Format the response
    const chartData = {
      ascentsByDifficulty: {
        labels: ascentsByDifficulty.map(d => d.grade),
        data: ascentsByDifficulty.map(d => d.count)
      },
      sendsByDate: {
        labels: sendsByDate.map(d => d.date),
        sends: sendsByDate.map(d => d.sends),
        attempts: sendsByDate.map(d => d.attempts)
      },
      metricsOverTime: {
        labels: sendRate.map(d => d.date),
        metrics: [{
          name: 'Send Rate',
          data: sendRate.map(d => d.rate)
        }]
      }
    };

    console.log('[Charts API] Returning chart data for user:', req.user.id);
    res.json(chartData);
  } catch (error) {
    console.error('[Charts API] Error fetching chart data:', error);
    res.status(500).json({ 
      error: "Failed to fetch chart data",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;