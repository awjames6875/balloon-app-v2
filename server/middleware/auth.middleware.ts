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
export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    // Cast to the right type
    req.userId = req.session.userId;
    
    // The session.userRole is a string, make sure it's a valid role type
    const role = req.session.userRole;
    if (role === 'admin' || role === 'designer' || role === 'inventory_manager') {
      req.userRole = role;
    }
    
    return next();
  }
  
  return res.status(401).json({ message: 'Authentication required' });
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