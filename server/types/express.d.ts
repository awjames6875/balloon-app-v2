/**
 * Custom type definitions for Express
 */

import { Request } from 'express';

/**
 * Extended Request type with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: Express.User;
  userId?: number;    // Used by some existing code that adds this property
  userRole?: string;  // Used by some existing code that adds this property
}