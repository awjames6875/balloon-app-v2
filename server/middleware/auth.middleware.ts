/**
 * Authentication Middleware Module
 * 
 * Provides middleware functions for handling authentication and authorization.
 */

import { Request, Response, NextFunction } from 'express';
import { Express } from 'express';
import { storage } from '../storage';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

/**
 * Extend the Express Request interface to include user authentication properties
 */
export interface AuthenticatedRequest extends Request {
  userId: number;
  userRole: string;
  session: Express.Session & {
    userId?: number;
    userRole?: string;
  };
}

/**
 * Configure passport authentication with local strategy
 * @param app Express application
 */
export function configurePassport(app: Express): void {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure local strategy for username/password authentication
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        // Find user by username
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  // Serialize and deserialize user for session management
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        return done(null, false);
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error, null);
    }
  });
}

/**
 * Middleware to check if a user is authenticated
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    // Add userId and userRole to request object for route handlers
    (req as any).userId = req.session.userId;
    (req as any).userRole = req.session.userRole;
    console.log('Session active for user ID:', req.session.userId);
    return next();
  }
  console.log('Authentication required but not found in session');
  return res.status(401).json({ message: 'Authentication required' });
}

/**
 * Middleware factory to check if a user has the required role(s)
 * @param roles Array of roles that are allowed to access the route
 * @returns Middleware function
 */
export function hasRole(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Add userId and userRole to request object for route handlers
    (req as any).userId = req.session.userId;
    (req as any).userRole = req.session.userRole;
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
}

/**
 * Middleware to check if a user owns a resource or is an admin
 * Use this for routes where the resource ID is in the URL params
 * @param getResourceFn Function to get the resource by ID
 * @param userIdField Field name in the resource that contains the user ID
 * @returns Middleware function
 */
export function isResourceOwnerOrAdmin<T extends { [key: string]: any }>(
  getResourceFn: (id: number) => Promise<T | undefined>,
  userIdField: keyof T = 'userId' as keyof T
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Add userId and userRole to request object for route handlers
    (req as any).userId = req.session.userId;
    (req as any).userRole = req.session.userRole;
    
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    
    const resource = await getResourceFn(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    const userId = req.session.userId;
    const resourceUserId = resource[userIdField];
    
    // Get user to check if they're an admin
    const user = await storage.getUser(userId);
    const isAdmin = user && user.role === 'admin';
    
    if (resourceUserId !== userId && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
}

/**
 * Middleware to check if a user owns a design or is an admin
 * This is a specific implementation used in design routes
 */
export function isDesignOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Add userId and userRole to request object for route handlers
  (req as any).userId = req.session.userId;
  (req as any).userRole = req.session.userRole;
  
  const designId = parseInt(req.params.id);
  if (isNaN(designId)) {
    return res.status(400).json({ message: 'Invalid design ID' });
  }
  
  // Use the standard storage
  storage.getDesign(designId)
    .then((design) => {
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      const userId = req.session.userId!; // Non-null assertion as we already checked above
      
      // Get user to check if they're an admin
      return storage.getUser(userId)
        .then((user) => {
          const isAdmin = user && user.role === 'admin';
          
          if (design.userId !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
          }
          
          next();
        });
    })
    .catch((error) => {
      console.error('Error in isDesignOwnerOrAdmin middleware:', error);
      res.status(500).json({ message: 'Server error' });
    });
}