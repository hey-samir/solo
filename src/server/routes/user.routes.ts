import { Router, Request, Response } from 'express';

const router = Router();

// Get user profile
router.get('/:username', (req: Request, res: Response) => {
  res.json({ 
    message: 'Get user profile route', 
    username: req.params.username 
  });
});

// Update user profile
router.put('/:username', (req: Request, res: Response) => {
  res.json({ 
    message: 'Update user profile route', 
    username: req.params.username,
    body: req.body 
  });
});

export default router;