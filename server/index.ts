import dotenv from "dotenv";
import "dotenv/config";
import express, { NextFunction, type Request, Response } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import paymentRoutes from "./routes/paymentRoutes";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['NODE_ENV', 'FRONTEND_URL', 'API_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

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

// Apply CORS with configuration
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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
      console.log(logLine);
    }
  });

  next();
});

// Register routes
registerRoutes(app);
app.use('/api', paymentRoutes);

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error('Error:', err);
});

// Export the app for Vercel
export default app;

// For local development, start the server
if (!process.env.VERCEL) {
  const portsToTry = [3001, 3002, 5001, 5002, 5003];
  const host = process.env.HOST || '0.0.0.0';

  const tryStartServer = (portIndex = 0) => {
    if (portIndex >= portsToTry.length) {
      console.error('All ports are in use.');
      process.exit(1);
    }

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : portsToTry[portIndex];

    const server = app.listen(port, host, () => {
      console.log(`Server is running on http://${host}:${port}`);
      console.log(`API base URL: http://${host}:${port}/api`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying next port...`);
        server.close();
        tryStartServer(portIndex + 1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });
  };

  tryStartServer();
}