const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const path = require('path');
const { users, routes, climbs } = require('./db/schema');
const { eq } = require('drizzle-orm');

type RequestHandler = express.RequestHandler;
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

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

    const allowedDomains = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /^https?:\/\/localhost/,
      /^http?:\/\/localhost/,
      /^https?:\/\/127\.0\.0\.1/,
      /^http?:\/\/127\.0\.0\.1/
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../../dist');
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// API Routes
// Add redirect for root path to /about
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/about');
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.get('/api/user/:username', async (req: Request, res: Response, next: NextFunction) => {
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
});

app.get('/api/climbs', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userClimbs = await db.select().from(climbs);
    res.json(userClimbs);
  } catch (error) {
    next(error);
  }
});

app.get('/api/routes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userRoutes = await db.select().from(routes);
    res.json(userRoutes);
  } catch (error) {
    next(error);
  }
});

// Catch-all route handler for the SPA
app.get('*', (_req: Request, res: Response) => {
  console.log('Handling route:', _req.url);
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = { db };