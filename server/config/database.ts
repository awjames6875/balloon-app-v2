/**
 * Database Configuration Module
 * 
 * Provides database connection pools and configuration.
 */

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../shared/schema';

const { Pool } = pg;

/**
 * Configure database connection pool
 * Uses environment variables for connection details
 */
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Additional pool configuration for production environments
  ...(process.env.NODE_ENV === 'production' ? {
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
  } : {})
});

/**
 * Initialize Drizzle ORM with the database connection pool
 */
export const database = drizzle(pool, { schema });

/**
 * Event handlers for the database connection pool
 */
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

/**
 * Test the database connection
 * Returns a boolean indicating if the connection was successful
 */
export async function testConnection(): Promise<boolean> {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
}