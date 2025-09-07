import dotenv from "dotenv";
import "dotenv/config";
import express, { NextFunction, type Request, Response } from "express";
import http from 'http';
import { registerRoutes } from "./routes.ts";

import { log, serveStatic, setupVite } from "./vite.js";
import paymentRoutes from "./routes/paymentRoutes.ts";

// Load environment variables from .env file
dotenv.config();

// Debug: Log environment variables
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  ORANGE_MONEY_MERCHANT_KEY: process.env.ORANGE_MONEY_MERCHANT_KEY ? '***' : 'MISSING',
  ORANGE_MONEY_CLIENT_ID: process.env.ORANGE_MONEY_CLIENT_ID ? '***' : 'MISSING',
  ORANGE_MONEY_CLIENT_SECRET: process.env.ORANGE_MONEY_CLIENT_SECRET ? '***' : 'MISSING',
  ORANGE_MONEY_BASE_URL: process.env.ORANGE_MONEY_BASE_URL
});

// Set environment variables for Vite development server
if (process.env.NODE_ENV === "development") {
  process.env.VITE_HOST = "0.0.0.0";
  process.env.VITE_ALLOWED_HOSTS = "all";
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Enregistrer les routes existantes
  registerRoutes(app);
  
  // Enregistrer les routes de paiement
  app.use('/api', paymentRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // For Vercel, export the app instead of starting a server
  if (process.env.VERCEL) {
    // Export for Vercel serverless functions - no Vite/Rollup needed
    module.exports = app;
  } else {
    // Local development server
    const portsToTry = [5002, 5003, 5004, 5005];
    const host = process.env.HOST || "127.0.0.1";
    
    const startServer = async (portIndex = 0) => {
      if (portIndex >= portsToTry.length) {
        console.error('All ports are in use. Please free up a port or try again later.');
        process.exit(1);
      }
      
      const port = process.env.PORT ? Number(process.env.PORT) : portsToTry[portIndex];
      const server = http.createServer(app);
      
      // Setup Vite in development
      if (app.get("env") === "development") {
        // Add middleware to handle host header before Vite processes it
        app.use((req, res, next) => {
          // Override host header to avoid allowedHosts restriction
          if (req.headers.host && req.headers.host.includes('.replit.dev')) {
            req.headers.host = `localhost:${port}`;
          }
          next();
        });
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }
      
      server.on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying next port...`);
          startServer(portIndex + 1);
          return;
        }
        console.error('Server error:', e);
        process.exit(1);
      });
      
      server.listen(port, host, () => {
        console.log(`🚀 Server running on http://${host}:${port}`);
      });
    };
    
    startServer();
  }
})();
