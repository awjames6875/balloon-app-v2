import { Request } from 'express';

/**
 * Extended Request type with authenticated user information
 */
export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
  user: Express.User;
}