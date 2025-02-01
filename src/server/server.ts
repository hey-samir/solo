import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';

// Debug mode
const debug = process.env.NODE_ENV !== 'production';
console.log('Starting server in debug mode');
console.log('Environment:', process.env.NODE_ENV);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gosolo.nyc', 'https://www.gosolo.nyc']
    : ['http://localhost:3003', `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

if (debug) {
  console.log('CORS configuration:', corsOptions);
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Get the absolute path to the dist directory
const distPath = path.resolve(__dirname, '../../dist');
console.log('Static files path:', distPath);

// Debug middleware
app.use((req, res, next) => {
  if (debug) {
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
  }
  next();
});

// API routes
app.get('/api/health', (_req, res) => {
  if (debug) console.log('Health check endpoint called');
  res.json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// Updated Google Auth callback handler
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { access_token, redirect_uri } = req.body;

    if (!access_token) {
      throw new Error('No access token provided');
    }

    // Get user info from Google
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userData = await response.json();

    // Create or update user session
    req.session.user = {
      email: userData.email,
      name: userData.given_name,
      picture: userData.picture,
      provider: 'google'
    };

    // Set session cookie
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to save session' 
        });
      }

      res.json({ 
        success: true, 
        user: req.session.user,
        redirect: redirect_uri || '/profile'
      });
    });
  } catch (error) {
    console.error('Google auth callback error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});

// Serve static files with proper MIME types and cache control
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }

    if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle all routes for the SPA - This should be after static files but before API routes
app.get('/*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  if (debug) console.log('SPA route hit:', req.path);
  res.sendFile(path.join(distPath, 'index.html'), err => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

try {
  app.listen(PORT, HOST, () => {
    console.log('Server configuration:');
    console.log('- Port:', PORT);
    console.log('- Environment:', process.env.NODE_ENV);
    console.log('- Static path:', distPath);
    console.log(`Server running at http://${HOST}:${PORT}`);

    if (debug) {
      console.log('Replit environment:');
      console.log('- REPL_SLUG:', process.env.REPL_SLUG);
      console.log('- REPLIT_DB_URL:', process.env.REPLIT_DB_URL ? 'Set' : 'Not set');
    }
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

export { app };