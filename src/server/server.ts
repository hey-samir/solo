import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Explicitly set the dist path
const distPath = path.join(__dirname, '../../dist');
console.log('Static files path:', distPath);

// First handle API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Static file handling with explicit MIME types and debugging
app.use(express.static(distPath, {
  fallthrough: true // Allow falling through to next middleware if file not found
}));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}).on('error', function (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export { app };