import express, { RequestHandler } from 'express';
import cors from 'cors';
import { json } from 'express';
import dotenv from 'dotenv';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import path from 'path';
import { users, routes, climbs } from './db/schema';
import { eq } from 'drizzle-orm';

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

// CORS Configuration
const corsOptions = {
  origin: function(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // In production, only allow specific origins
    const allowedDomains = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /^https?:\/\/localhost/,
      /^https?:\/\/127\.0\.0\.1/
    ];

    const isAllowed = allowedDomains.some(domain => domain.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(json({ limit: '10mb' }));

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  console.log('Serving static files from:', distPath);
  app.use(express.static(distPath));
}

// API Routes
const healthCheckHandler: RequestHandler = (_req, res) => {
  res.json({ status: 'healthy' });
};

const getUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user || user.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user[0].id,
      username: user[0].username,
      profilePhoto: user[0].profilePhoto,
      memberSince: user[0].memberSince,
      gymId: user[0].gymId
    });
  } catch (error) {
    next(error);
  }
};

const getClimbsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const userClimbs = await db.select().from(climbs);
    res.json(userClimbs);
  } catch (error) {
    next(error);
  }
};

const getRoutesHandler: RequestHandler = async (_req, res, next) => {
  try {
    const userRoutes = await db.select().from(routes);
    res.json(userRoutes);
  } catch (error) {
    next(error);
  }
};

app.get('/api/health', healthCheckHandler);
app.get('/api/user/:username', getUserHandler);
app.get('/api/climbs', getClimbsHandler);
app.get('/api/routes', getRoutesHandler);

// Catch-all route for SPA in production
if (process.env.NODE_ENV === 'production') {
  const serveIndexHandler: RequestHandler = (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  };
  app.get('*', serveIndexHandler);
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { db };