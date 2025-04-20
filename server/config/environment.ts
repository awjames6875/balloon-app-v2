/**
 * Environment Configuration Module
 * 
 * This module centralizes all environment variable access and provides default values
 * to ensure consistent configuration across the application.
 */

/**
 * Application environment configuration
 */
export const env = {
  /**
   * Node environment (development, production, test)
   */
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  /**
   * Application port for the server
   */
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  /**
   * Database connection URL
   */
  DATABASE_URL: process.env.DATABASE_URL,
  
  /**
   * Session secret for cookie encryption
   */
  SESSION_SECRET: process.env.SESSION_SECRET || 'balloon-app-secret', 
  
  /**
   * Session cookie max age in milliseconds
   * Default: 30 days
   */
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || String(30 * 24 * 60 * 60 * 1000), 10),
  
  /**
   * Upload directory path
   */
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  
  /**
   * Maximum upload file size in bytes
   * Default: 10MB
   */
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || String(10 * 1024 * 1024), 10),
};

/**
 * Helper function to check if the application is running in production
 * @returns True if running in production environment
 */
export function isProduction(): boolean {
  return env.NODE_ENV === 'production';
}

/**
 * Helper function to check if the application is running in development
 * @returns True if running in development environment
 */
export function isDevelopment(): boolean {
  return env.NODE_ENV === 'development';
}

/**
 * Helper function to check if the application is running in test
 * @returns True if running in test environment
 */
export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}