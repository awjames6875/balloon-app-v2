/**
 * Database Configuration Module
 * 
 * This module handles PostgreSQL database connectivity through Neon Serverless.
 * It configures the Drizzle ORM connection and exports the database instance.
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon Serverless
neonConfig.webSocketConstructor = ws;

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Database connection pool for PostgreSQL
 */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Drizzle ORM database instance with schema
 */
export const database = drizzle({ client: pool, schema });