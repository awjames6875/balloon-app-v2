/**
 * Configuration Module Index
 * 
 * This index file re-exports all configuration modules for easier imports.
 */

export * from './database';
export * from './environment';

// Import and validate environment at startup
import { validateEnvironment } from './environment';

// Validate environment variables when this module is imported
try {
  validateEnvironment();
} catch (error: any) {
  console.error('Environment validation error:', error.message);
  // In production, exit the process on critical environment errors
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}