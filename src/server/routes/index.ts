import { Router } from 'express';
import userRoutes from './user.routes';
import climbRoutes from './climb.routes';
import sessionRoutes from './session.routes';

const router = Router();

// Health check route
router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount feature routes
router.use('/users', userRoutes);
router.use('/climbs', climbRoutes);
router.use('/sessions', sessionRoutes);

export default router;
