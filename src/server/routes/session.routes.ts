import { Router } from 'express';

const router = Router();

// Get all sessions
router.get('/', (_req, res) => {
  res.json({ message: 'Get all sessions route' });
});

// Get specific session
router.get('/:id', (req, res) => {
  res.json({ 
    message: 'Get specific session route',
    sessionId: req.params.id 
  });
});

// Create new session
router.post('/', (req, res) => {
  res.json({ 
    message: 'Create session route',
    body: req.body 
  });
});

export default router;
