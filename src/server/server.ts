import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, routes, climbs } from './db/schema.js';
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
const corsOptions: cors.CorsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || process.env.NODE_ENV === 'development') {
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
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// MIME type mapping
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'application/font-woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Serve static files with proper MIME types
app.use(express.static(distPath, {
  index: false,
  setHeaders: (res: Response, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// User routes
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
    console.error('Error fetching user:', error);
    next(error);
  }
});

// Climbs routes
app.get('/api/climbs', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userClimbs = await db.select().from(climbs);
    res.json(userClimbs);
  } catch (error) {
    console.error('Error fetching climbs:', error);
    next(error);
  }
});

// Routes routes
app.get('/api/routes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const userRoutes = await db.select().from(routes);
    res.json(userRoutes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    next(error);
  }
});

// Catch-all route handler for the SPA
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  const indexPath = path.join(distPath, 'index.html');

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache');

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Internal Server Error');
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
  console.log('Static files being served from:', distPath);
}).on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export { db };