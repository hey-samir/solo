import { Router, Request, Response } from 'express';

const router = Router();

// Get all climbs
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Get all climbs route' });
});

// Get specific climb
router.get('/:id', (req: Request, res: Response) => {
  res.json({ 
    message: 'Get specific climb route',
    climbId: req.params.id 
  });
});

// Create new climb
router.post('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Create climb route',
    body: req.body 
  });
});

export default router;