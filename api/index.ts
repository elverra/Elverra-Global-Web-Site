// Vercel serverless function entry point
import express from 'express';
import routes from '../server/routes.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Initialize routes
routes.registerRoutes(app);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use(errorHandler);

// For Vercel serverless, static files are served by Vercel directly
// No need for Vite/Rollup in serverless functions

export default app;
