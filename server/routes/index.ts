import { Express, Router } from 'express';
import { Server } from 'http';

// Import route modules
import authRouter from './auth.routes';
import designRouter from './design.routes';
import inventoryRouter from './inventory.routes';
import accessoryRouter from './accessory.routes';
import orderRouter from './order.routes';
import productionRouter from './production.routes';
import paymentRouter from './payment.routes';
import uploadRouter from './upload.routes';

/**
 * Register all application routes
 * @param app Express application
 * @returns HTTP server instance
 */
export function registerRoutes(app: Express): Server {
  // Mount routers to specific paths
  app.use('/api/auth', authRouter);
  app.use('/api/designs', designRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/accessories', accessoryRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/production', productionRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/upload', uploadRouter);
  
  // Start HTTP server
  const PORT = parseInt(process.env.PORT || '3001', 10);
  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}