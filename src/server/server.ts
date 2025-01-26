import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to allow requests from development server
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:3000', 'http://localhost:3001', 'https://solo.nyc']
    : true,
  credentials: true
};

app.use(cors(corsOptions));

// Explicitly set the dist path
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// First handle API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Static file handling with explicit MIME types
app.use(express.static(distPath, {
  fallthrough: true // Allow falling through to next middleware if file not found
}));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;

// Add error handling for already in use port
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please ensure no other process is using this port.`);
    process.exit(1);
  } else {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app };