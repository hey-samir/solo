import express from 'express';
import cors from 'cors';
import { json } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import userRoutes from './routes/user';
import climbRoutes from './routes/climbs';
import routeRoutes from './routes/routes';

dotenv.config();

try {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
    credentials: true
  }));

  app.use(json());
  app.use(express.static('dist'));

  // Simple authentication middleware for development
  app.use((req, res, next) => {
    // Add a mock user for development
    req.user = {
      id: 1,
      gymId: 1
    };
    next();
  });

  // API routes
  app.use('/api/user', userRoutes);
  app.use('/api/climbs', climbRoutes);
  app.use('/api/routes', routeRoutes);

  // Health check endpoint
  app.get('/api/health', (_, res) => {
    res.json({ status: 'healthy' });
  });

  // Serve React app for all non-API routes
  app.get('*', (_, res) => {
    if (app.get('env') === 'production') {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    } else {
      res.redirect('http://localhost:3000');
    }
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Server failed to start:', error);
  process.exit(1);
}