import { Router, Request, Response } from 'express';
import { db } from '../db';
import { routes } from '../db/schema';
import { desc } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[Routes API] Fetching routes...');

    const allRoutes = await db
      .select({
        id: routes.id,
        color: routes.color,
        grade: routes.grade,
        wall_sector: routes.wall_sector,
        anchor_number: routes.anchor_number,
        created_at: routes.created_at
      })
      .from(routes)
      .orderBy(desc(routes.created_at));

    console.log('[Routes API] Routes fetched:', {
      count: allRoutes.length,
      sample: allRoutes.slice(0, 2)
    });

    res.json(allRoutes);
  } catch (error) {
    console.error('[Routes API] Error fetching routes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch routes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;