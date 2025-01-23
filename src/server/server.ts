import express, { Request, Response } from 'express';
import cors from 'cors';
import { json } from 'express';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, routes, climbs } from './db/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

// Initialize express app
const app = express();

// Database setup
let db;
try {
  console.log('Connecting to database...');
  const client = postgres(process.env.DATABASE_URL!, {
    max: 20,
    idle_timeout: 30,
    connect_timeout: 10,
  });
  db = drizzle(client);
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection failed:', error);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://0.0.0.0:3000'],
  credentials: true
}));

app.use(json({ limit: '10mb' }));

// API Routes
app.get('/api/health', (_: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

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

app.get('/api/climbs', async (_: Request, res: Response) => {
  try {
    const userClimbs = await db.select().from(climbs);
    res.json(userClimbs);
  } catch (error) {
    console.error('Error fetching climbs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/routes', async (_: Request, res: Response) => {
  try {
    const userRoutes = await db.select().from(routes);
    res.json(userRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { db };