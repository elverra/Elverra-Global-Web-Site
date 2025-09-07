// Vercel serverless function entry point
import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../server/routes.js';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['https://www.elverraglobalml.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize routes
registerRoutes(app);

// 404 handler
app.use((req, res) => {
  console.log(`404 - ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;
