/**
 * Environment Configuration Module
 * 
 * Provides environment-specific configuration values and validation.
 */

/**
 * Environment variable configuration with defaults
 */
export const environment = {
  // Server configuration
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'balloon-app-secret',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // File upload configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  
  // API configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Payment configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Application URLs
  APP_URL: process.env.APP_URL || 'http://localhost:5000',
  
  // Feature flags
  ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES === 'true',
  ENABLE_PAYMENTS: process.env.ENABLE_PAYMENTS === 'true',
  
  // Get a Boolean environment variable
  getBoolean(name: string): boolean {
    return process.env[name]?.toLowerCase() === 'true';
  },
  
  // Check if we're in production mode
  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },
  
  // Check if we're in development mode
  isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  },
  
  // Check if we're in test mode
  isTest(): boolean {
    return this.NODE_ENV === 'test';
  }
};

/**
 * Validate required environment variables
 * Throws an error if any required variables are missing
 */
export function validateEnvironment(): void {
  const requiredVars: Array<keyof typeof environment> = [
    'DATABASE_URL'
  ];
  
  const missingVars = requiredVars.filter(varName => !environment[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Additional validation for production environment
  if (environment.isProduction()) {
    // Check for production-specific variables
    const productionVars: Array<keyof typeof environment> = [
      'SESSION_SECRET'
    ];
    
    const missingProductionVars = productionVars.filter(
      varName => environment[varName] === 'balloon-app-secret'
    );
    
    if (missingProductionVars.length > 0) {
      console.warn(`Using default values for production environment variables: ${missingProductionVars.join(', ')}`);
    }
  }
}