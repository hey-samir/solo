import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS setup with specific origins for better security
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gosolo.nyc', /\.repl\.co$/, /\.replit\.dev$/]
    : ['http://localhost:3000', /\.repl\.co$/, /\.replit\.dev$/],
  credentials: true
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files from the dist directory
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath, {
  index: false // Don't serve index.html for every request
}));

// SPA fallback - must come after static file serving
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Ensure PORT is properly typed
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export { app };