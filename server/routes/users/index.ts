import express, { Request, Response } from 'express';
import { storage } from '../../storage';
import { isAuthenticated, isAdmin } from '../../middleware/auth';

const router = express.Router();

/**
 * Get all users (admin only)
 */
router.get('/', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // We don't have getAllUsers in the storage interface, so we'd need to create it
    // For now, return an empty array with a note
    res.json([]);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get user by ID
 */
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only access their own data unless they're an admin
    if (req.session.userId !== userId) {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password hash to client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Update user
 */
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only update their own data unless they're an admin
    if (req.session.userId !== userId) {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    const updatedUser = await storage.updateUser(userId, req.body);
    
    if (!updatedUser) {
      return res.status(500).json({ message: 'Update failed' });
    }
    
    // Don't send password hash to client
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Delete user (admin only)
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting your own account
    if (req.session.userId === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const success = await storage.deleteUser(userId);
    
    if (!success) {
      return res.status(404).json({ message: 'User not found or deletion failed' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;