import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { json } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, routes, climbs } from './db/schema';
import { eq } from 'drizzle-orm';

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
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

app.use(json({ limit: '10mb' }));
app.use(express.static('dist', {
  maxAge: '1h' // Cache static assets for 1 hour
}));

// Simple auth middleware for development
app.use((req: Request, _: Response, next: NextFunction) => {
  // Add a mock user for development
  req.user = {
    id: 1,
    gymId: 1
  };
  next();
});

// Health check endpoint
app.get('/api/health', (_: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// User endpoint with proper error handling and types
app.get('/api/user/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user[0].id,
      username: user[0].username,
      profilePhoto: user[0].profilePhoto,
      memberSince: user[0].memberSince,
      gymId: user[0].gymId
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Climbs endpoint with proper error handling and types
app.get('/api/climbs', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userClimbs = await db.select().from(climbs).where(eq(climbs.userId, req.user.id));
    res.json(userClimbs);
  } catch (error) {
    console.error('Error fetching climbs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes endpoint with proper error handling and types
app.get('/api/routes', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRoutes = await db.select().from(routes).where(eq(routes.gymId, req.user.gymId!));
    res.json(userRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for non-API routes
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