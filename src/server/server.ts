import express from 'express';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import compression from 'compression';
import morgan from 'morgan';
import { sql } from '@vercel/postgres';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));

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

// Updated Google Auth callback handler with user existence check
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
      // Check if user exists in database
      const result = await sql`
        SELECT id, email, username 
        FROM users 
        WHERE email = ${userData.email}
      `;

      const userExists = result.rows.length > 0;

      res.json({
        success: true,
        isNewUser: !userExists,
        user: {
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