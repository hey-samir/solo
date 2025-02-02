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

// Mount feature routes
router.use('/users', userRoutes);
router.use('/routes', routeRoutes);
router.use('/climbs', climbRoutes);
router.use('/sessions', sessionRoutes);
router.use('/feedback', feedbackRoutes);

export default router;