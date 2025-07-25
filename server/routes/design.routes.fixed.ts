import { Router, Request, Response, NextFunction } from 'express';
import { isAuthenticated, hasRole, isDesignOwnerOrAdmin } from '../middleware/auth.middleware';
import { storage } from '../storage';
import { insertDesignSchema } from '../../shared/schema';
import { z } from 'zod';
import { uploadDesignImage } from '../middleware/upload.middleware';
import { RepositoryFactory } from '../repositories';
import { AuthenticatedRequest } from '../types/express';
import { calculateBalloonRequirements } from '../ai';

const router = Router();

// Type-safe Express request handler
function createHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req, res, next);
  };
}

// Type-safe Express authenticated request handler
function createAuthHandler(handler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void> | void) {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res, next);
  };
}

/**
 * Get all designs for current user
 * GET /api/designs
 * Requires authentication
 */
router.get('/', isAuthenticated, createAuthHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const designs = await storage.getDesignsByUser(req.userId);
    res.json(designs);
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ message: 'Failed to fetch designs' });
  }
}));

/**
 * Get a design by ID
 * GET /api/designs/:id
 * Requires authentication and ownership of the design or admin role
 */
router.get('/:id', isAuthenticated, createAuthHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    const design = await storage.getDesign(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    // Check user permission: either owner of the design or admin
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(design);
  } catch (error) {
    console.error('Get design error:', error);
    res.status(500).json({ message: 'Failed to fetch design' });
  }
}));

/**
 * Create a new design
 * POST /api/designs
 * Requires authentication
 */
router.post('/', isAuthenticated, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  uploadDesignImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!authReq.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const imageFile = req.file;
      
      if (!imageFile) {
        return res.status(400).json({ message: 'Design image is required' });
      }
      
      const data = {
        ...req.body,
        userId: authReq.userId,
        imageUrl: `/uploads/${imageFile.filename}`
      };
      
      // If the design data doesn't include a client name, use a default
      if (!data.clientName) {
        data.clientName = 'Anonymous Client';
      }
      
      const design = await storage.createDesign(data);
      
      res.status(201).json(design);
    } catch (error) {
      console.error('Create design error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid design data', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: 'Failed to create design' });
    }
  });
});

/**
 * Update a design
 * PATCH /api/designs/:id
 * Requires authentication and ownership of the design or admin role
 */
router.patch('/:id', isAuthenticated, createAuthHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    const design = await storage.getDesign(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    // Check user permission: either owner of the design or admin
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = ['clientName', 'eventDate', 'dimensions', 'notes', 'backgroundUrl', 'elements'];
    const updates: Record<string, any> = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid update fields provided' });
    }
    
    const updatedDesign = await storage.updateDesign(designId, updates);
    
    if (!updatedDesign) {
      return res.status(500).json({ message: 'Failed to update design' });
    }
    
    res.json(updatedDesign);
  } catch (error) {
    console.error('Update design error:', error);
    res.status(500).json({ message: 'Failed to update design' });
  }
}));

/**
 * Delete a design
 * DELETE /api/designs/:id
 * Requires authentication and ownership of the design or admin role
 */
router.delete('/:id', isAuthenticated, createAuthHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    const design = await storage.getDesign(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    // Check user permission: either owner of the design or admin
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const success = await storage.deleteDesign(designId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete design' });
    }
    
    res.json({ success: true, message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({ message: 'Failed to delete design' });
  }
}));

/**
 * Check inventory for a design
 * POST /api/designs/:id/check-inventory
 * Requires authentication and ownership of the design or admin role
 */
router.post('/:id/check-inventory', isAuthenticated, isDesignOwnerOrAdmin, createAuthHandler(async (req, res) => {
  try {
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    const { materialRequirements } = req.body;
    
    if (!materialRequirements || typeof materialRequirements !== 'object') {
      return res.status(400).json({ message: 'Material requirements are required' });
    }
    
    // Get all inventory
    const inventory = await storage.getAllInventory();
    
    // Check material requirements against inventory
    const unavailableItems: Array<{
      color: string;
      size: string;
      required: number;
      available: number;
      status: 'available' | 'low' | 'unavailable';
    }> = [];
    
    const availableItems: Array<{
      color: string;
      size: string;
      required: number;
      available: number;
      status: 'available';
    }> = [];
    
    for (const [color, sizes] of Object.entries(materialRequirements)) {
      const colorInventory = inventory.filter(item => 
        item.color.toLowerCase() === color.toLowerCase()
      );
      
      // Check each size
      for (const [size, quantity] of Object.entries(sizes as Record<string, number>)) {
        const sizeLabel = size === 'small' ? '11inch' : '16inch';
        const inventoryItem = colorInventory.find(item => item.size === sizeLabel);
        
        if (!inventoryItem || inventoryItem.quantity < quantity) {
          unavailableItems.push({
            color,
            size: sizeLabel,
            required: quantity,
            available: inventoryItem ? inventoryItem.quantity : 0,
            status: !inventoryItem ? 'unavailable' : 
                   inventoryItem.quantity < quantity ? 'low' : 'available'
          });
        } else {
          availableItems.push({
            color,
            size: sizeLabel,
            required: quantity,
            available: inventoryItem.quantity,
            status: 'available'
          });
        }
      }
    }
    
    // Return inventory status with kid-friendly language
    res.json({
      designId,
      available: unavailableItems.length === 0,
      availableItems,
      unavailableItems,
      message: unavailableItems.length === 0 
        ? "We have all the balloons you need! 🎈" 
        : "We need to order some more balloons. 🎈",
      kidFriendly: {
        success: unavailableItems.length === 0,
        message: unavailableItems.length === 0 
          ? "Yay! We have all the balloons you need! 🎈" 
          : "Oops! We need to get some more balloons. Do you want to order them? 🎈",
        emoji: unavailableItems.length === 0 ? "✅" : "⚠️",
        unavailableColors: unavailableItems.map(item => 
          `${item.color} (${item.size === '11inch' ? 'small' : 'large'})`
        )
      }
    });
  } catch (error) {
    console.error('Check inventory error:', error);
    res.status(500).json({ 
      message: 'Failed to check inventory',
      kidFriendly: {
        success: false,
        message: "Oops! Something went wrong checking our balloon supply. Please try again!",
        emoji: "❌"
      }
    });
  }
}));

/**
 * Create a production request from a design
 * POST /api/designs/:id/create-production
 * Requires authentication and ownership of the design or admin role
 */
router.post('/:id/create-production', isAuthenticated, isDesignOwnerOrAdmin, createAuthHandler(async (req, res) => {
  try {
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    const { notes, eventDate } = req.body;
    
    // Create production record
    const production = await storage.createProduction({
      designId,
      status: 'pending',
      notes: notes || null,
      startDate: new Date()
      // These fields are managed internally or during updates
      // completionDate and actualTime are not in the InsertProduction type
    });
    
    res.status(201).json(production);
  } catch (error) {
    console.error('Create production error:', error);
    res.status(500).json({ message: 'Failed to create production request' });
  }
}));

/**
 * Create a design with elements
 * POST /api/designs/create
 * Requires authentication
 */
router.post('/create', isAuthenticated, createAuthHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { clientName = 'Anonymous Client', eventDate, elements = [], backgroundUrl, notes } = req.body;
    
    console.log('Creating design with elements:', Array.isArray(elements) ? elements.length : 'N/A');
    console.log('Elements type:', typeof elements);
    
    // Create the design
    // Fix: Don't stringify elements, pass them directly
    const design = await storage.createDesign({
      userId: req.userId,
      clientName,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      elements: elements, // Pass elements directly, Drizzle will handle JSON
      backgroundUrl: backgroundUrl || null,
      notes: notes || ''
    });
    
    console.log('Design created successfully:', design.id);
    res.status(201).json(design);
  } catch (error) {
    console.error('Create design error:', error);
    res.status(500).json({ message: 'Failed to create design' });
  }
}));

/**
 * Create a design with elements and analyze required balloons
 * POST /api/designs/create-with-analysis
 * Requires authentication
 */
router.post('/create-with-analysis', isAuthenticated, createAuthHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { clientName = 'Anonymous Client', eventDate, elements = [], backgroundUrl, notes } = req.body;
    
    // Create the design
    // Fix: Don't stringify elements, pass them directly
    const design = await storage.createDesign({
      userId: req.userId,
      clientName,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      elements: elements, // Pass elements directly, Drizzle will handle JSON
      backgroundUrl: backgroundUrl || null,
      notes: notes || ''
    });
    
    // Analyze balloon requirements (simplified for now)
    const analysis = {
      totalBalloons: 0,
      materialRequirements: {} as Record<string, Record<string, number>>,
      colors: [] as string[]
    };
    
    // Extract colors and count balloons from elements
    if (elements && Array.isArray(elements)) {
      elements.forEach(element => {
        if (element.type === 'balloon-cluster') {
          analysis.totalBalloons += 4; // Assuming each cluster has 4 balloons
          
          if (Array.isArray(element.colors)) {
            element.colors.forEach((color: string) => {
              if (!analysis.colors.includes(color)) {
                analysis.colors.push(color);
              }
              
              if (!analysis.materialRequirements[color]) {
                analysis.materialRequirements[color] = {
                  small: 0,
                  large: 0
                };
              }
              
              // Assume 75% small balloons and 25% large
              analysis.materialRequirements[color].small += 3;
              analysis.materialRequirements[color].large += 1;
            });
          }
        }
      });
    }
    
    // Create a kid-friendly response
    const kidFriendlyMessage = analysis.totalBalloons > 0
      ? `Your balloon design needs ${analysis.totalBalloons} balloons in ${analysis.colors.length} colors!`
      : "Your design doesn't have any balloons yet. Let's add some!";
    
    res.status(201).json({
      design,
      analysis,
      kidFriendly: {
        success: true,
        message: kidFriendlyMessage,
        emoji: "🎈",
        totalBalloons: analysis.totalBalloons,
        colorCount: analysis.colors.length,
        colors: analysis.colors
      }
    });
  } catch (error) {
    console.error('Create design with analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to create and analyze design',
      kidFriendly: {
        success: false,
        message: "Oops! Something went wrong creating your balloon design. Please try again!",
        emoji: "❌"
      }
    });
  }
}));

/**
 * Save material requirements to inventory
 * POST /api/designs/:id/save-to-inventory
 * Requires authentication and ownership of the design or admin role
 */
router.post('/:id/save-to-inventory', isAuthenticated, isDesignOwnerOrAdmin, createAuthHandler(async (req, res) => {
  try {
    const designId = parseInt(req.params.id);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    const { materialCounts } = req.body;
    
    if (!materialCounts || typeof materialCounts !== 'object') {
      return res.status(400).json({ message: 'Material counts are required' });
    }
    
    // Get all inventory for updating
    const inventory = await storage.getAllInventory();
    const updatedItems = [];
    const insufficientItems = [];
    
    // Check and update each material
    for (const [color, sizes] of Object.entries(materialCounts)) {
      // For each balloon size
      for (const [size, quantity] of Object.entries(sizes as Record<string, number>)) {
        const sizeLabel = size === 'small' ? '11inch' : '16inch';
        
        // Find matching inventory item
        const inventoryItem = inventory.find(item => 
          item.color.toLowerCase() === color.toLowerCase() && 
          item.size === sizeLabel
        );
        
        if (!inventoryItem) {
          insufficientItems.push({
            color,
            size: sizeLabel,
            required: quantity,
            available: 0
          });
          continue;
        }
        
        // Check if we have enough
        if (inventoryItem.quantity < quantity) {
          insufficientItems.push({
            color,
            size: sizeLabel,
            required: quantity,
            available: inventoryItem.quantity
          });
          continue;
        }
        
        // Update inventory
        const updatedItem = await storage.updateInventoryItem(inventoryItem.id, {
          quantity: inventoryItem.quantity - quantity
        });
        
        if (updatedItem) {
          updatedItems.push({
            color,
            size: sizeLabel,
            consumed: quantity,
            remaining: updatedItem.quantity
          });
        }
      }
    }
    
    // Determine the response message
    let message, kidFriendlyMessage, success;
    
    if (insufficientItems.length > 0) {
      success = false;
      message = 'Some materials are not available in sufficient quantities.';
      kidFriendlyMessage = 'Oops! We need to get more balloons before we can make this design.';
    } else {
      success = true;
      message = 'Materials successfully deducted from inventory.';
      kidFriendlyMessage = 'Hooray! We used these balloons to make your design!';
    }
    
    res.json({
      success,
      designId,
      updatedItems,
      insufficientItems,
      message,
      kidFriendly: {
        success,
        message: kidFriendlyMessage,
        emoji: success ? "✅" : "⚠️",
        updatedColors: updatedItems.map(item => 
          `${item.color} (${item.size === '11inch' ? 'small' : 'large'}): ${item.consumed}`
        )
      }
    });
  } catch (error) {
    console.error('Save to inventory error:', error);
    res.status(500).json({ 
      message: 'Failed to update inventory',
      kidFriendly: {
        success: false,
        message: "Oops! Something went wrong updating our balloon supply. Please try again!",
        emoji: "❌"
      }
    });
  }
}));

export default router;