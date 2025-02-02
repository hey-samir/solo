import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, sends, routes } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get user stats
router.get('/me/stats', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ 
        error: 'Please log in to view your climbing statistics.',
        details: 'Authentication required' 
      });
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

    res.json(stats[0]);
  } catch (error) {
    console.error('[Stats API] Error:', error);
    res.status(500).json({ 
      error: 'Unable to load your climbing statistics. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user profile
router.get('/profile', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ 
        error: 'Please log in to view your profile.',
        details: 'Authentication required' 
      });
    }

    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!userProfile) {
      return res.status(404).json({ 
        error: 'Profile not found.',
        details: 'User profile could not be located' 
      });
    }

    res.json({
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
      name: userProfile.name,
      profilePhoto: userProfile.profile_photo,
      memberSince: userProfile.member_since,
      gymId: userProfile.gym_id,
      userType: userProfile.user_type
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    res.status(500).json({ 
      error: 'Unable to load your profile. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;