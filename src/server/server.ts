import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

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