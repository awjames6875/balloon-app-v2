import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import memorystore from 'memorystore';
import { Express } from 'express';

import { pool } from '../db';

// Create memory store
const MemoryStore = memorystore(session);

/**
 * Configure session middleware based on environment
 * @param app Express application
 */
export function configureSessionMiddleware(app: Express): void {
  const secret = process.env.SESSION_SECRET || 'balloon-design-secret';
  const isProd = process.env.NODE_ENV === 'production';
  
  // Base session options
  const sessionOptions: session.SessionOptions = {
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };
  
  // Use PostgreSQL session store in production, memory store in development
  if (isProd && process.env.DATABASE_URL) {
    const PgStore = connectPgSimple(session);
    sessionOptions.store = new PgStore({
      pool,
      tableName: 'session', // Make sure this table exists
      createTableIfMissing: true,
    });
  } else {
    // Use memory store for development
    sessionOptions.store = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
  }
  
  // Apply session middleware
  app.use(session(sessionOptions));
}