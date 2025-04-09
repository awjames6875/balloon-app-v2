import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * Register a new user
 * POST /api/auth/register
 * Public access
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with default 'designer' role
    const userData = {
      username,
      email,
      password: hashedPassword,
      fullName,
      role: 'designer' as const
    };
    
    // Validate user data
    const validatedUserData = insertUserSchema.parse(userData);
    
    // Create the user
    const user = await storage.createUser(validatedUserData);
    
    // Create session
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      user: userWithoutPassword,
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid user data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * Login a user
 * POST /api/auth/login
 * Public access
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Check required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }
    
    // Find user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    if (req.session) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Get the current user's profile
 * GET /api/auth/me
 * Used by the frontend to check authentication status
 */
router.get('/me', async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  
  // Get userId from either passport or session
  let userId: number | undefined;
  
  if (req.isAuthenticated() && req.user) {
    userId = req.user.id;
  } else if (req.session && req.session.userId) {
    userId = req.session.userId;
  }
  
  if (!userId) {
    console.log('Auth check failed: User not authenticated');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    console.log('User authenticated:', userId);
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get the current user's profile
 * GET /api/auth/profile
 * Requires authentication
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * Logout a user by destroying the session
 * POST /api/auth/logout
 * Requires authentication
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session?.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

export default router;