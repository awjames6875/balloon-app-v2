import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Extended Request interface that includes user authentication information
 */
export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: 'admin' | 'designer' | 'inventory_manager';
}

/**
 * Authentication middleware that checks if a user is logged in
 * Sets userId and userRole on request if authenticated
 */
export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.session) {
      console.error('No session found');
      return res.status(401).json({ message: 'No session found' });
    }

    if (!req.session.userId) {
      console.error('No userId in session');
      return res.status(401).json({ message: 'Session expired' });
    }

    // Verify user still exists in database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      console.error(`User ${req.session.userId} not found in database`);
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user info on request
    req.userId = user.id;
    
    // Ensure session always has correct role
    if (!req.session.userRole || req.session.userRole !== user.role) {
      req.session.userRole = user.role;
    }
    
    // Set role on request
    req.userRole = user.role;

    // Refresh session
    req.session.touch();
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Authorization middleware that checks if a user has admin role
 * Must be used after isAuthenticated
 */
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

/**
 * Authorization middleware that checks if a user has inventory manager role
 * Must be used after isAuthenticated
 */
export const isInventoryManager = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'inventory_manager' && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Inventory manager access required' });
  }
  
  next();
};

/**
 * Authorization middleware that checks if a user has designer role
 * Must be used after isAuthenticated
 */
export const isDesigner = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'designer' && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Designer access required' });
  }
  
  next();
};

/**
 * Middleware to check if a user owns a design or has admin role
 * Must be used after isAuthenticated
 */
export const isDesignOwnerOrAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const designId = parseInt(req.params.designId);
  if (isNaN(designId)) {
    return res.status(400).json({ message: 'Invalid design ID' });
  }
  
  const design = await storage.getDesign(designId);
  if (!design) {
    return res.status(404).json({ message: 'Design not found' });
  }
  
  if (design.userId !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
};

/**
 * Middleware to check if a user owns an order or has admin role
 * Must be used after isAuthenticated
 */
export const isOrderOwnerOrAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const orderId = parseInt(req.params.orderId || req.params.id);
  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }
  
  const order = await storage.getOrder(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  
  if (order.userId !== req.userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  next();
};