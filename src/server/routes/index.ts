import { Router } from 'express';
import userRoutes from './user.routes';
import climbRoutes from './climb.routes';
import sessionRoutes from './session.routes';
import routeRoutes from './routes';
import feedbackRoutes from './feedback.routes';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Add debug middleware for route tracking
router.use((req, _res, next) => {
  console.log('API Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    authenticated: req.isAuthenticated?.(),
    timestamp: new Date().toISOString()
  });
  next();
});

// Leaderboard endpoint
router.get('/leaderboard', async (_req, res) => {
  try {
    // Return empty array if no data to prevent map errors
    res.json([]);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mount feature routes
router.use('/users', userRoutes);
router.use('/routes', routeRoutes);
router.use('/climbs', climbRoutes);
router.use('/sessions', sessionRoutes);
router.use('/feedback', feedbackRoutes);

export default router;