import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { routes } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const getUserRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching routes for user...');

    if (!req.user?.id) {
      console.log('User not authenticated');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userRoutes = await db.select().from(routes);
    console.log('Routes fetched:', userRoutes);

    const transformedRoutes = userRoutes.map(route => ({
      id: route.id,
      routeId: route.route_id,
      color: route.color,
      grade: route.grade,
      wallSector: route.wall_sector,
      anchorNumber: route.anchor_number
    }));

    res.json(transformedRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/', getUserRoutes);

export default router;