import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { sends, routes, users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: typeof users.$inferSelect;
}

const getUserClimbs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
        rating: sends.rating,
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
      rating: climb.rating,
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