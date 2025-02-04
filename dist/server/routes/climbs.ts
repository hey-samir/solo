import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { sends, routes, users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Define the correct type for req.user based on your schema
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    name: string | null;
    profile_photo: string | null;
    created_at: Date;
    member_since: Date;
    gym_id: number | null;
    user_type: 'demo' | 'user' | 'admin';
  };
}

const getUserClimbs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userClimbs = await db
      .select({
        id: sends.id,
        route_id: sends.route_id,
        status: sends.status,
        tries: sends.tries,
        notes: sends.notes,
        points: sends.points,
        created_at: sends.created_at,
        route: {
          color: routes.color,
          grade: routes.grade
        }
      })
      .from(sends)
      .innerJoin(routes, eq(sends.route_id, routes.id))
      .where(eq(sends.user_id, req.user.id))
      .orderBy(sends.created_at);

    const transformedClimbs = userClimbs.map(climb => ({
      id: climb.id,
      routeId: climb.route_id,
      status: climb.status,
      tries: climb.tries,
      notes: climb.notes,
      points: climb.points,
      createdAt: climb.created_at?.toISOString(),
      route: {
        color: climb.route.color,
        grade: climb.route.grade
      }
    }));

    res.json(transformedClimbs);
  } catch (error) {
    console.error('Error fetching climbs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/', getUserClimbs);

export default router;