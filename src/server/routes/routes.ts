import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { routes } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const getUserRoutes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching routes...');

    // Remove authentication check temporarily for testing
    const allRoutes = await db.select().from(routes);
    console.log('Routes fetched:', allRoutes);

    const transformedRoutes = allRoutes.map(route => ({
      id: route.id,
      color: route.color,
      grade: route.grade,
      wall_sector: route.wall_sector,
      anchor_number: route.anchor_number
    }));

    res.json(transformedRoutes);
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