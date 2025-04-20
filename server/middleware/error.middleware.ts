import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware
 * Centralizes error handling throughout the application 
 */
export function errorHandler() {
  return (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Extract status and message from error object
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log the error details for debugging
    console.error('Express error:', err);
    
    // Send standardized error response to client
    res.status(status).json({ message });
  };
}