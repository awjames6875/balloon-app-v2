import { Express } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from '../db';

// Import route modules
import authRoutes from './auth';
import userRoutes from './users';
import designRoutes from './design.routes';
import inventoryRoutes from './inventory.routes';
import accessoryRoutes from './accessory.routes';
import productionRoutes from './production.routes';
import orderRoutes from './order.routes';

/**
 * Register all application routes
 */
export function registerRoutes(app: Express): void {
  // Initialize PostgreSQL session store
  const PostgresStore = connectPg(session);
  
  // Session setup for authentication
  app.use(session({
    store: new PostgresStore({
      pool,
      tableName: 'session', // Use this table for session storage
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'balloon-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/designs', designRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/accessories', accessoryRoutes);
  app.use('/api/production', productionRoutes);
  app.use('/api/orders', orderRoutes);
}