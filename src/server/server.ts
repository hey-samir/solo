import express from 'express';
import cors from 'cors';
import { json } from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(json());

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files from the dist directory
app.use(express.static('dist'));

// Handle all routes for the React app
app.get('/*', (req, res) => {
  // Don't handle API routes here
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
  }
});

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});