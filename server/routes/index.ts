import { Express } from 'express';
import authRoutes from './auth.routes';
import designRoutes from './design.routes';
import inventoryRoutes from './inventory.routes';
import accessoryRoutes from './accessory.routes';
import productionRoutes from './production.routes';
import orderRoutes from './order.routes';
import uploadRoutes from './upload.routes';

/**
 * Register all API routes with the Express application
 * @param app Express application instance
 */
export function registerRoutes(app: Express): void {
  // Auth routes
  app.use('/api/auth', authRoutes);
  
  // Design routes
  app.use('/api/designs', designRoutes);
  
  // Inventory routes
  app.use('/api/inventory', inventoryRoutes);
  
  // Accessory routes
  app.use('/api/accessories', accessoryRoutes);
  
  // Production routes
  app.use('/api/production', productionRoutes);
  
  // Order routes
  app.use('/api/orders', orderRoutes);
  
  // Upload routes
  app.use('/api/upload', uploadRoutes);
  
  // Define a static file server for the uploads directory
  app.use('/uploads', (req, res, next) => {
    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    next();
  });
  
  console.log('✅ All API routes registered successfully');
}