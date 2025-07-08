import { Express } from 'express';
import { pool } from '../db';

// Import route modules
import authRoutes from './auth';
import userRoutes from './users';
import clientRoutes from './clients.routes';
import designRoutes from './design.routes';
import inventoryRoutes from './inventory.routes';
import accessoryRoutes from './accessory.routes';
import productionRoutes from './production.routes';
import orderRoutes from './order.routes';

/**
 * Register all application routes
 */
export function registerRoutes(app: Express): void {
  // NOTE: Session is already configured in server/routes.ts
  // Do not add a second session configuration here

  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/designs', designRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/accessories', accessoryRoutes);
  app.use('/api/production', productionRoutes);
  app.use('/api/orders', orderRoutes);
}