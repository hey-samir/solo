import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // Enable compression
app.use(morgan(isProduction ? 'combined' : 'dev')); // Logging

// CORS Configuration
const corsOptions = {
  origin: isProduction 
    ? ['https://gosolo.nyc', 'https://www.gosolo.nyc']
    : ['http://localhost:3003', `https://${process.env.REPL_ID}-3003.${process.env.REPL_OWNER}.repl.co`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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

// Updated Google Auth callback handler
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { access_token } = req.body;

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

    // Check if user exists in your database
    // This is a placeholder - implement according to your actual user storage
    const existingUser = false; // Replace with actual user check

    if (existingUser) {
      // Create session for existing user
      req.session.user = {
        email: userData.email,
        name: userData.given_name,
        picture: userData.picture,
        provider: 'google'
      };

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
          isNewUser: false,
          user: req.session.user
        });
      });
    } else {
      // For new users, return success but indicate they need to complete registration
      res.json({ 
        success: true, 
        isNewUser: true,
        user: {
          email: userData.email,
          name: userData.given_name,
          picture: userData.picture
        }
      });
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