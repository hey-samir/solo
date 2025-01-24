import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import compression from 'compression';
import { users, routes, climbs } from './db/schema.js';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs';

dotenv.config();

// Initialize express app
const app = express();

// Database setup
let db: PostgresJsDatabase;
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

// Enable compression for all responses
app.use(compression());

// CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const distPath = path.join(projectRoot, 'dist');

// Log environment and paths
console.log(`Server running in ${process.env.NODE_ENV} mode`);
console.log('Project root:', projectRoot);
console.log('Static files path:', distPath);
console.log('Dist directory exists:', fs.existsSync(distPath));

// Function to check if dist directory and index.html exist
const isDistReady = () => {
  const indexPath = path.join(distPath, 'index.html');
  const exists = fs.existsSync(distPath) && fs.existsSync(indexPath);
  console.log('Checking dist directory:', exists ? 'ready' : 'not ready');
  return exists;
};

// Serve static files with proper caching
if (isDistReady()) {
  console.log('Serving static files from:', distPath);
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true,
    index: false // We'll handle index.html separately
  }));
}

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    mode: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    distReady: isDistReady()
  });
});

// User routes
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

// Routes routes
app.get('/api/routes', async (req: Request, res: Response) => {
  try {
    const gymId = req.query.gymId;
    if (!gymId) {
      return res.json([]);
    }

    const gymRoutes = await db.select()
      .from(routes)
      .where(eq(routes.gymId, Number(gymId)));

    res.json(gymRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Climbs routes
app.get('/api/climbs', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userClimbs = await db.select()
      .from(climbs)
      .where(eq(climbs.userId, Number(userId)))
      .orderBy(desc(climbs.createdAt));

    res.json(userClimbs);
  } catch (error) {
    console.error('Error fetching climbs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SPA fallback - handle all non-API routes
app.get('*', (req: Request, res: Response) => {
  // Skip API routes
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Check if dist is ready
  if (!isDistReady()) {
    console.log('Waiting for production build to complete...');
    return res.status(503).send(
      'Application is building. Please try again in a moment. If this persists, the build may have failed.'
    );
  }

  const indexPath = path.join(distPath, 'index.html');

  // Send index.html with appropriate headers
  res.sendFile(indexPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    lastModified: true,
    etag: true,
    headers: {
      'Cache-Control': process.env.NODE_ENV === 'production' ? 'public, max-age=31536000' : 'no-cache'
    }
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log('Dist status:', isDistReady() ? 'ready' : 'waiting for build');
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { db };