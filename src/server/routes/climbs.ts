import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { climbs, routes, User } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: User;
}

const getUserClimbs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userClimbs = await db
      .select({
        id: climbs.id,
        route_id: climbs.route_id,
        status: climbs.status,
        rating: climbs.rating,
        tries: climbs.tries,
        notes: climbs.notes,
        points: climbs.points,
        created_at: climbs.created_at,
        route: {
          color: routes.color,
          grade: routes.grade
        }
      })
      .from(climbs)
      .innerJoin(routes, eq(climbs.route_id, routes.id))
      .where(eq(climbs.user_id, req.user.id))
      .orderBy(climbs.created_at);

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