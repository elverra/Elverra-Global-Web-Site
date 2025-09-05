import dotenv from "dotenv";
import "dotenv/config";
import express, { NextFunction, type Request, Response } from "express";
import http from 'http';
import { registerRoutes } from "./routes.js";
import { log, serveStatic, setupVite } from "./vite.js";

// Load environment variables from .env file
dotenv.config();

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
  registerRoutes(app);

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
    const server = http.createServer(app);
    const port = Number(process.env.PORT) || 5000;
    const host = process.env.HOST || "127.0.0.1";

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      // Add middleware to handle host header before Vite processes it
      app.use((req, res, next) => {
        // Override host header to avoid allowedHosts restriction
        if (req.headers.host && req.headers.host.includes('.replit.dev')) {
          req.headers.host = 'localhost:5000';
        }
        next();
      });
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen(port, host, () => {
      log(`🚀 Server running on http://${host}:${port}`);
    });
  }
})();
