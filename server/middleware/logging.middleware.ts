/**
 * Logging Middleware Module
 * 
 * Provides middleware functions for request logging and error tracking.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware
 * Logs HTTP method, URL, and response time for each request
 */
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    
    // Add response listener to log the response time
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      
      console.log(
        `${new Date().toISOString()} [request] ${method} ${originalUrl} ${statusCode} in ${duration}ms`
      );
    });
    
    next();
  };
}

/**
 * API request logger with more detailed information for API routes
 * Includes request body for non-GET requests and query params
 */
export function apiLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only log API routes
    if (!req.originalUrl.startsWith('/api')) {
      return next();
    }
    
    const start = Date.now();
    const { method, originalUrl } = req;
    
    // Log request details (excluding sensitive info)
    if (method !== 'GET') {
      // Create a sanitized copy of the body without passwords
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
      if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[REDACTED]';
      if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[REDACTED]';
      
      console.log(`API Request ${method} ${originalUrl} :: body:`, sanitizedBody);
    } else if (Object.keys(req.query).length > 0) {
      console.log(`API Request ${method} ${originalUrl} :: query:`, req.query);
    }
    
    // Add response listener
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      
      // Log more detailed information for slow requests or errors
      if (duration > 500 || statusCode >= 400) {
        console.log(`${method} ${originalUrl} ${statusCode} in ${duration}ms :: SLOW OR ERROR`);
      } else {
        console.log(`${method} ${originalUrl} ${statusCode} in ${duration}ms`);
      }
    });
    
    next();
  };
}