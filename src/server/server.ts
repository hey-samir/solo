import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import compression from 'compression';
import { users, routes, climbs } from './db/schema.js';
import { eq } from 'drizzle-orm';
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
const corsOptions: cors.CorsOptions = {
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedDomains = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /\.repl\.dev$/,
      /^https?:\/\/localhost/,
      /^http?:\/\/localhost/,
      /^https?:\/\/127\.0\.0\.1/,
      /^http?:\/\/127\.0\.0\.1/,
      '1f44956e-bc47-48a8-a13e-c5f6222c2089-00-35jfb2x2btqr5.picard.replit.dev'
    ];

    // Always allow in development mode or if there's no origin (like direct file access)
    if (!origin || process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // Check if the origin matches any of our allowed domains
    const isAllowed = allowedDomains.some(domain => {
      if (typeof domain === 'string') {
        return domain === origin;
      }
      return domain.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
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

// Configure static file serving based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const distPath = path.join(__dirname, '../../dist');

console.log(`Server running in ${process.env.NODE_ENV} mode`);
console.log('Static files being served from:', distPath);
console.log('Directory exists:', fs.existsSync(distPath));

// Serve static files first
app.use(express.static(distPath));

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    mode: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
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

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  const indexPath = path.join(distPath, 'index.html');
  console.log('Serving index.html for path:', req.path);
  console.log('Index path:', indexPath);
  console.log('Index exists:', fs.existsSync(indexPath));

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
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