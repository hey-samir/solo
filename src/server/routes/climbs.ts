import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { climbs } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const getUserClimbs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userClimbs = await db.query.climbs.findMany({
      where: eq(climbs.userId, req.user.id),
      orderBy: (climbs, { desc }) => [desc(climbs.createdAt)]
    });

    res.json(userClimbs.map(climb => ({
      id: climb.id,
      routeId: climb.routeId,
      status: climb.status,
      rating: climb.rating,
      tries: climb.tries,
      notes: climb.notes,
      points: climb.points,
      createdAt: climb.createdAt
    })));
  } catch (error) {
    console.error('Error fetching climbs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/', getUserClimbs);

export default router;