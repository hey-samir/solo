import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sends, routes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

// Apply authentication middleware
router.use(isAuthenticated);

// Get all climbs
router.get('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ 
        error: 'Please log in to view climbs',
        details: 'Authentication required'
      });
      return;
    }

    const climbs = await db
      .select()
      .from(sends)
      .leftJoin(routes, eq(sends.route_id, routes.id))
      .where(eq(sends.user_id, req.user.id))
      .orderBy(sends.created_at);

    res.json(climbs);
  } catch (error) {
    console.error('[Climbs API] Error fetching climbs:', error);
    res.status(500).json({
      error: 'Failed to fetch climbs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get specific climb
router.get('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ 
        error: 'Please log in to view climb details',
        details: 'Authentication required'
      });
      return;
    }

    const climb = await db
      .select()
      .from(sends)
      .leftJoin(routes, eq(sends.route_id, routes.id))
      .where(eq(sends.id, parseInt(req.params.id)))
      .limit(1);

    if (!climb.length) {
      res.status(404).json({ 
        error: 'Climb not found',
        details: 'The requested climb could not be found'
      });
      return;
    }

    res.json(climb[0]);
  } catch (error) {
    console.error('[Climbs API] Error fetching climb:', error);
    res.status(500).json({
      error: 'Failed to fetch climb details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;