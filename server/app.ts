import express, { type Express, Request, Response, NextFunction } from 'express';
import { createServer, type Server } from 'http';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Middleware
import { configureSessionMiddleware } from './middleware/session.middleware';
import { configurePassport, isAuthenticated } from './middleware/auth.middleware';

// Routes
import { registerRoutes } from './routes/index';

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.') as any);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

/**
 * Initialize and configure the Express application
 */
export async function createApp(): Promise<{ app: Express, server: Server }> {
  // Create Express app
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Add request logging middleware
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

  // Configure session and authentication
  configureSessionMiddleware(app);
  configurePassport(app);

  // Make multer middleware available on app
  app.locals.upload = upload;

  // Register API routes
  registerRoutes(app);

  // Serve static files from uploads directory with authentication
  app.use('/uploads', isAuthenticated, (req, res, next) => {
    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ message });
    console.error('Express error:', err);
  });

  // Create HTTP server
  const server = createServer(app);

  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });

  return { app, server };
}