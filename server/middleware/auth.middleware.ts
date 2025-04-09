import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcryptjs from 'bcryptjs';
import { Express } from 'express';

import { RepositoryFactory } from '../repositories';
import { AuthenticatedRequest } from '../types/express';

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      role: string;
    }
  }
}

/**
 * Configure passport authentication
 * @param app Express application instance
 */
export function configurePassport(app: Express): void {
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          const userRepository = RepositoryFactory.getUserRepository();
          const user = await userRepository.findByUsername(username);
          
          if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          const isMatch = await bcryptjs.compare(password, user.password);
          
          if (!isMatch) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          // Don't include password in the user object
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const userRepository = RepositoryFactory.getUserRepository();
      const user = await userRepository.findById(id);
      
      if (!user) {
        return done(null, false);
      }
      
      // Don't include password in the user object
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
}

/**
 * Middleware to check if user is authenticated
 * This middleware also adds userId and userRole to the request object
 * Supports both passport authentication and session-based authentication
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Check for passport authentication first
  if (req.isAuthenticated() && req.user) {
    // Add user ID and role to the request for easier access in route handlers
    const authReq = req as AuthenticatedRequest;
    authReq.userId = req.user.id;
    authReq.userRole = req.user.role;
    console.log('User authenticated via passport:', authReq.userId);
    return next();
  } 
  // Fall back to session-based authentication
  else if (req.session && req.session.userId) {
    const authReq = req as AuthenticatedRequest;
    authReq.userId = req.session.userId;
    authReq.userRole = req.session.userRole as string;
    console.log('User authenticated via session:', authReq.userId);
    return next();
  }
  
  // If we get here, the user is not authenticated
  console.log('Authentication failed, no valid session or passport auth');
  res.status(401).json({ message: 'Unauthorized' });
}

/**
 * Middleware to check if user has a specific role
 * @param roles Array of allowed roles
 */
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    // Try to get role from passport or session
    let userRole: string | undefined;
    
    if (req.isAuthenticated() && req.user) {
      userRole = req.user.role;
    } else if (req.session && req.session.userRole) {
      userRole = req.session.userRole as string;
    }
    
    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    next();
  };
}

/**
 * Middleware to check if user owns the design or is an admin
 */
export async function isDesignOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  
  // Get userId from either passport or session
  let userId: number | undefined;
  let userRole: string | undefined;
  
  if (req.isAuthenticated() && req.user) {
    userId = req.user.id;
    userRole = req.user.role;
    authReq.userId = userId;
    authReq.userRole = userRole;
  } else if (req.session && req.session.userId) {
    userId = req.session.userId;
    userRole = req.session.userRole as string;
    authReq.userId = userId;
    authReq.userRole = userRole;
  }
  
  if (!userId) {
    console.log('Design owner check failed: User not authenticated');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    // Use repository to get design
    const designRepository = RepositoryFactory.getDesignRepository();
    const design = await designRepository.findById(designId);
    
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    // Check if user is design owner or admin
    if (design.userId !== userId && userRole !== 'admin') {
      console.log(`Access denied: User ${userId} with role ${userRole} attempted to access design ${designId} owned by ${design.userId}`);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  } catch (error) {
    console.error('Design owner check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}