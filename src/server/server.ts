import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import path from 'path';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// CORS Configuration with proper origins
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000'] 
    : ['https://gosolo.nyc', /\.repl\.co$/, /\.replit\.dev$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));

  // SPA fallback for production
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port} in ${process.env.NODE_ENV || 'development'} mode`);
  }).on('error', (error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export { app };
