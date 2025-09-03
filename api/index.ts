// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes synchronously
registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  serveStatic(app);
}

export default app;
