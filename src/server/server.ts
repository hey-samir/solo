import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import userRoutes from './routes/user';
import climbRoutes from './routes/climbs';
import routeRoutes from './routes/routes';

dotenv.config();

// Initialize express app
const app = express();

// Database setup with connection pooling optimized for concurrent users
let db;
try {
  console.log('Connecting to database...');
  const client = postgres(process.env.DATABASE_URL!, {
    max: 20, // Maximum number of connections
    idle_timeout: 30, // Close idle connections after 30 seconds
    connect_timeout: 10, // Connection timeout after 10 seconds
  });
  db = drizzle(client);
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1); // Exit if database connection fails
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

// Increase payload size limit for concurrent uploads
app.use(json({ limit: '10mb' }));
app.use(express.static('dist', {
  maxAge: '1h' // Cache static assets for 1 hour
}));

// Simple authentication middleware for development
app.use((req: Request, _: Response, next: NextFunction) => {
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
app.get('/api/health', (_: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Serve React app for all non-API routes
app.get('*', (_: Request, res: Response) => {
  if (app.get('env') === 'production') {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  } else {
    res.redirect('http://localhost:3000');
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { db };