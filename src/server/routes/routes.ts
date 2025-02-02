import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { routes } from '../db/schema';

const router = Router();

const getUserRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching routes...');

    const allRoutes = await db.select({
      id: routes.id,
      color: routes.color,
      grade: routes.grade,
      wall_sector: routes.wall_sector,
      anchor_number: routes.anchor_number,
      created_at: routes.created_at
    }).from(routes);

    console.log('Routes fetched:', allRoutes);

    if (!allRoutes) {
      throw new Error('No routes found');
    }

    res.json(allRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch routes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

router.get('/', getUserRoutes);

export default router;