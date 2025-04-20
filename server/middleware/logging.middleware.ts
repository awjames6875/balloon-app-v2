import { Request, Response, NextFunction } from 'express';

/**
 * Creates a middleware that logs API requests with timing information
 * - Captures request path, method, status code
 * - Measures request duration
 * - Optionally includes response data for API routes (truncated for readability)
 */
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record the start time 
    const startTime = Date.now();
    const requestPath = req.path;
    
    // Only intercept and log responses for API routes
    if (requestPath.startsWith('/api')) {
      let capturedJsonResponse: Record<string, any> | undefined = undefined;
      
      // Monkey patch res.json to capture response body
      const originalResJson = res.json;
      res.json = function(bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };
      
      // Log after response is sent
      res.on("finish", () => {
        const duration = Date.now() - startTime;
        let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
        
        // Include response data if available (truncated for readability)
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }
        }
        
        console.log(logLine);
      });
    }
    
    next();
  };
}