import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { routes } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const getUserRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRoutes = await db.query.routes.findMany({
      where: eq(routes.gymId, req.user.gymId as number)
    });

    res.json(userRoutes.map(route => ({
      id: route.id,
      routeId: route.routeId,
      color: route.color,
      grade: route.grade,
      rating: route.rating,
      dateSet: route.dateSet
    })));
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/', getUserRoutes);

export default router;