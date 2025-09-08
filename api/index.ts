// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes synchronously
registerRoutes(app);

// For Vercel serverless, static files are served by Vercel directly
// No need for Vite/Rollup in serverless functions

export default app;
