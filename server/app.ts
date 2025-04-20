import express, { type Express } from 'express';
import { createServer, type Server } from 'http';
import path from 'path';

// Middleware
import { configureSessionMiddleware } from './middleware/session.middleware';
import { configurePassport, isAuthenticated } from './middleware/auth.middleware';
import { configureFileUpload } from './middleware/upload.middleware';
import { requestLogger } from './middleware/logging.middleware';
import { errorHandler } from './middleware/error.middleware';

// Routes
import { registerRoutes } from './routes/index';

/**
 * Initialize and configure the Express application
 */
export async function createApp(): Promise<{ app: Express, server: Server }> {
  // Create Express app
  const app = express();

  // Configure file upload middleware
  const upload = configureFileUpload();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(requestLogger());

  // Configure session and authentication
  configureSessionMiddleware(app);
  configurePassport(app);

  // Make multer middleware available on app for routes
  app.locals.upload = upload;

  // Register API routes
  registerRoutes(app);

  // Serve static files from uploads directory with authentication
  app.use('/uploads', isAuthenticated, (req, res, next) => {
    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // Global error handler - must be registered last
  app.use(errorHandler());

  // Create HTTP server
  const server = createServer(app);

  return { app, server };
}