import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

/**
 * Middleware to check if a user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    // Add userId and userRole to request object for route handlers
    (req as any).userId = req.session.userId;
    (req as any).userRole = req.session.userRole;
    console.log("User authenticated via session:", req.session.userId);
    return next();
  }
  console.log("Auth check failed: User not authenticated");
  return res.status(401).json({ message: 'Not authenticated' });
};

/**
 * Middleware to check if a user has a specific role
 */
export const hasRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      console.log("Role check failed: User not authenticated");
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Add userId and userRole to request object for route handlers
    (req as any).userId = req.session.userId;
    (req as any).userRole = req.session.userRole;

    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        console.log("Role check failed: User not found", req.session.userId);
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (user.role !== role && user.role !== 'admin') {
        console.log(`Role check failed: User ${user.id} has role ${user.role}, needs ${role}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error("Error checking user role:", error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

/**
 * Middleware to check if a user is an admin
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Add userId and userRole to request object for route handlers
  (req as any).userId = req.session.userId;
  (req as any).userRole = req.session.userRole;

  try {
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};