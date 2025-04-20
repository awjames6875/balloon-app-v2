import { Express } from 'express';
import { Server } from 'http';
import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

/**
 * Main application bootstrap function
 * Initializes the Express application and starts the HTTP server
 */
async function startServer() {
  try {
    // Initialize app and server
    const { app, server } = await createApp();
    
    log('Express application and server created successfully');
    
    // Configure environment-specific middleware
    // In development: Setup Vite for hot reloading
    // In production: Serve static files
    configureStaticAssets(app, server);
    
    // Start the HTTP server
    const PORT = 5000;
    const HOST = "0.0.0.0";
    
    server.listen({
      port: PORT,
      host: HOST,
      reusePort: true,
    }, () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Configure static assets based on environment
 * Note: Vite middleware must be registered after API routes to prevent catch-all interference
 */
function configureStaticAssets(app: Express, server: Server) {
  if (app.get("env") === "development") {
    setupVite(app, server);
  } else {
    serveStatic(app);
  }
}

// Bootstrap the application
startServer();
