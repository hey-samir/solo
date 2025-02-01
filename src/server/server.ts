import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import { createClient } from '@vercel/postgres';
import authRoutes from './routes/auth';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Configure database connection
const db = createClient({
  connectionString: process.env.DATABASE_URL
});

// Connect to the database
db.connect().catch(err => {
  console.error('Failed to connect to the database:', err);
});

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));

// CORS Configuration with credentials
const corsOptions = {
  origin: isProduction 
    ? ['https://gosolo.nyc', 'https://www.gosolo.nyc']
    : [
        'http://localhost:3003',
        `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`,
        'http://localhost:5000'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Session configuration with secure settings
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: isProduction ? '.gosolo.nyc' : undefined,
  },
  name: 'solo.sid', // Custom session ID name
  proxy: true // Trust the reverse proxy
};

// Initialize session middleware
app.use(session(sessionConfig));

// Register routes
app.use('/api', authRoutes);

// Auth status middleware for debugging
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Is Authenticated:', !!req.session.user);
  console.log('Cookies:', req.headers.cookie);
  next();
});

// Get the absolute path to the dist directory
const distPath = path.resolve(__dirname, '../../dist');

// Serve static files with proper MIME types and cache control
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        error: 'No access token provided'
      });
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const userData = await response.json();

    if (!userData.email || !userData.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email not verified or not available'
      });
    }

    try {
      // Check if user exists and has complete profile
      const result = await db.query(
        'SELECT id, email, username, profile_completed FROM users WHERE email = $1',
        [userData.email]
      );

      const userExists = result.rows.length > 0;
      const profileCompleted = userExists && result.rows[0].profile_completed;

      if (userExists && profileCompleted) {
        // Set user in session
        req.session.user = {
          id: result.rows[0].id,
          email: result.rows[0].email,
          username: result.rows[0].username,
          profileCompleted: true
        };

        await new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            resolve(true);
          });
        });
      }

      res.json({
        success: true,
        isNewUser: !userExists,
        needsProfile: userExists && !profileCompleted,
        user: userExists ? {
          ...req.session.user,
          needsProfile: !profileCompleted
        } : {
          email: userData.email,
          name: userData.given_name || userData.name,
          picture: userData.picture
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to check user existence');
    }
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Handle all routes for the SPA
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

export { app };