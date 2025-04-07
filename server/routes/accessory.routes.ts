import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, isAdmin, isInventoryManager, AuthenticatedRequest } from '../middleware/auth.middleware';
import { insertAccessorySchema } from '@shared/schema';

const router = Router();

/**
 * Get all accessories
 * GET /api/accessories
 * Requires authentication
 */
router.get('/', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const accessories = await storage.getAllAccessories();
    res.json(accessories);
  } catch (error) {
    console.error('Error getting accessories:', error);
    res.status(500).json({ error: 'Failed to get accessories' });
  }
});

/**
 * Get an accessory by ID
 * GET /api/accessories/:id
 * Requires authentication
 */
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const accessoryId = parseInt(req.params.id);
    if (isNaN(accessoryId)) {
      return res.status(400).json({ error: 'Invalid accessory ID' });
    }
    
    const accessory = await storage.getAccessory(accessoryId);
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    res.json(accessory);
  } catch (error) {
    console.error('Error getting accessory:', error);
    res.status(500).json({ error: 'Failed to get accessory' });
  }
});

/**
 * Create a new accessory
 * POST /api/accessories
 * Requires inventory manager or admin role
 */
router.post('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is inventory manager or admin
    if (req.userRole !== 'inventory_manager' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Default status based on quantity and threshold
    let status = 'in_stock';
    if (req.body.quantity <= 0) {
      status = 'out_of_stock';
    } else if (req.body.quantity < req.body.threshold) {
      status = 'low_stock';
    }
    
    // Create the accessory with status calculation
    const accessoryData = {
      ...req.body,
      status
    };
    
    // Validate accessory data
    const validatedAccessoryData = insertAccessorySchema.parse(accessoryData);
    
    // Create the accessory
    const accessory = await storage.createAccessory(validatedAccessoryData);
    
    res.status(201).json(accessory);
  } catch (error: any) {
    console.error('Error creating accessory:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid accessory data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create accessory' });
  }
});

/**
 * Update an accessory
 * PATCH /api/accessories/:id
 * Requires inventory manager or admin role
 */
router.patch('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is inventory manager or admin
    if (req.userRole !== 'inventory_manager' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const accessoryId = parseInt(req.params.id);
    if (isNaN(accessoryId)) {
      return res.status(400).json({ error: 'Invalid accessory ID' });
    }
    
    const existingAccessory = await storage.getAccessory(accessoryId);
    if (!existingAccessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    // If quantity or threshold changed, recalculate status
    let statusUpdate = {};
    if (req.body.quantity !== undefined || req.body.threshold !== undefined) {
      const quantity = req.body.quantity ?? existingAccessory.quantity;
      const threshold = req.body.threshold ?? existingAccessory.threshold;
      
      let status = 'in_stock';
      if (quantity <= 0) {
        status = 'out_of_stock';
      } else if (quantity < threshold) {
        status = 'low_stock';
      }
      
      statusUpdate = { status };
    }
    
    // Update the accessory
    const updatedAccessory = await storage.updateAccessory(accessoryId, {
      ...req.body,
      ...statusUpdate
    });
    
    res.json(updatedAccessory);
  } catch (error) {
    console.error('Error updating accessory:', error);
    res.status(500).json({ error: 'Failed to update accessory' });
  }
});

/**
 * Add an accessory to a design
 * POST /api/accessories/:accessoryId/add-to-design/:designId
 * Requires authentication and ownership of the design or admin role
 */
router.post('/:accessoryId/add-to-design/:designId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const accessoryId = parseInt(req.params.accessoryId);
    const designId = parseInt(req.params.designId);
    const { quantity } = req.body;
    
    if (isNaN(accessoryId) || isNaN(designId)) {
      return res.status(400).json({ error: 'Invalid accessory or design ID' });
    }
    
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    // Check if accessory exists
    const accessory = await storage.getAccessory(accessoryId);
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    
    // Check if design exists
    const design = await storage.getDesign(designId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    
    // Check if user owns this design or is admin
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Add accessory to design
    await storage.addAccessoryToDesign(designId, accessoryId, quantity);
    
    // Get updated design accessories
    const designAccessories = await storage.getDesignAccessories(designId);
    
    res.status(200).json(designAccessories);
  } catch (error) {
    console.error('Error adding accessory to design:', error);
    res.status(500).json({ error: 'Failed to add accessory to design' });
  }
});

/**
 * Get accessories for a design
 * GET /api/accessories/design/:designId
 * Requires authentication and ownership of the design or admin role
 */
router.get('/design/:designId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const designId = parseInt(req.params.designId);
    
    if (isNaN(designId)) {
      return res.status(400).json({ error: 'Invalid design ID' });
    }
    
    // Check if design exists
    const design = await storage.getDesign(designId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    
    // Check if user owns this design or is admin
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get design accessories
    const designAccessories = await storage.getDesignAccessories(designId);
    
    res.json(designAccessories);
  } catch (error) {
    console.error('Error getting design accessories:', error);
    res.status(500).json({ error: 'Failed to get design accessories' });
  }
});

export default router;