/**
 * Error Handling Middleware Module
 * 
 * Provides middleware functions for centralized error handling.
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation/schema';

/**
 * Global error handler middleware
 * Catches all unhandled errors and returns appropriate responses
 */
export function errorHandler() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error details for debugging
  console.error('Error:', err?.message || 'Unknown error');
  if (process.env.NODE_ENV !== 'production' && err?.stack) {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: err.message,
      errors: err.errors
    });
  }
  
  // Handle Zod validation errors that weren't converted
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors || {}
    });
  }
  
  // Handle file upload errors from multer
  if (err?.name === 'MulterError') {
    return res.status(400).json({
      message: `File upload error: ${err.message || 'Unknown error'}`,
      field: err.field
    });
  }
  
  // Handle database connection errors
  if (err?.code && typeof err.code === 'string' && err.code.startsWith('PG')) {
    return res.status(503).json({
      message: 'Database error occurred',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Unknown database error')
    });
  }
  
  // Default error response
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Something went wrong';
  
  res.status(statusCode).json({
    message: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : message
  });
  };
}

/**
 * Handle 404 errors for routes that don't exist
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Wrap async route handlers to catch errors
 * This eliminates the need for try/catch blocks in every route
 * @param fn The async route handler function
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}