import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS configuration
app.use(cors({
  origin: isProduction ? 'https://gosolo.nyc' : 'http://localhost:3003',
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
});

export { app };