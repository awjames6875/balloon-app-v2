import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcryptjs from 'bcryptjs';
import { Express } from 'express';

import { RepositoryFactory } from '../repositories';
import { AuthenticatedRequest } from '../types';

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
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

/**
 * Middleware to check if user has a specific role
 * @param roles Array of allowed roles
 */
export function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    next();
  };
}