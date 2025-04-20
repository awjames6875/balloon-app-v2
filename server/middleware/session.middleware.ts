/**
 * Session Middleware Module
 * 
 * Provides middleware functions for session management.
 */

import { Express } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from '../config/database';

/**
 * Configure session middleware
 * Sets up PostgreSQL session store and configures session settings
 * @param app Express application
 */
export function configureSessionMiddleware(app: Express): void {
  // Initialize PostgreSQL session store
  const PostgresStore = connectPg(session);
  
  // Session configuration
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
  
  // Add session debugging in development
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      if (req.session && req.session.userId) {
        console.debug(`Session active for user ID: ${req.session.userId}`);
      }
      next();
    });
  }
}