import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../middleware/auth.middleware';
import { insertProductionSchema, inventoryStatusEnum } from '@shared/schema';

// Define a type for authenticated requests
interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

const router = Router();

/**
 * Get all productions for a design
 * GET /api/production/design/:designId
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
    
    const productions = await storage.getProductionsByDesign(designId);
    res.json(productions);
  } catch (error) {
    console.error('Error getting productions:', error);
    res.status(500).json({ error: 'Failed to get productions' });
  }
});

/**
 * Get a production by ID
 * GET /api/production/:id
 * Requires authentication
 */
router.get('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productionId = parseInt(req.params.id);
    if (isNaN(productionId)) {
      return res.status(400).json({ error: 'Invalid production ID' });
    }
    
    const production = await storage.getProduction(productionId);
    if (!production) {
      return res.status(404).json({ error: 'Production not found' });
    }
    
    // Check if user owns the associated design or is admin
    const design = await storage.getDesign(production.designId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(production);
  } catch (error) {
    console.error('Error getting production:', error);
    res.status(500).json({ error: 'Failed to get production' });
  }
});

/**
 * Create a new production
 * POST /api/production
 * Requires authentication
 */
router.post('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { designId } = req.body;
    if (!designId) {
      return res.status(400).json({ error: 'Design ID is required' });
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
    
    // Check for material requirements in the design
    if (!design.materialRequirements || Object.keys(design.materialRequirements).length === 0) {
      return res.status(400).json({ 
        error: 'Missing material requirements',
        details: 'This design does not have material requirements specified. Please update the design first.'
      });
    }
    
    // Get all inventory to check availability
    const allInventory = await storage.getAllInventory();
    
    // Check inventory availability and prepare updates
    const updates = [];
    const insufficientItems = [];
    
    // Process each color in material requirements
    for (const [color, requirements] of Object.entries(design.materialRequirements)) {
      // Get inventory for this color
      const colorInventory = allInventory.filter(
        item => item.color.toLowerCase() === color.toLowerCase()
      );
      
      // Check small balloons (11inch)
      const small = requirements.small || 0;
      if (small > 0) {
        const smallInventory = colorInventory.find(item => item.size === '11inch');
        if (!smallInventory || smallInventory.quantity < small) {
          insufficientItems.push({
            color,
            size: '11inch',
            required: small,
            available: smallInventory ? smallInventory.quantity : 0
          });
          continue;
        }
        
        // Determine the new inventory status based on quantity
        const newQuantity = smallInventory.quantity - small;
        let newStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
        
        if (newQuantity <= 0) {
          newStatus = 'out_of_stock';
        } else if (newQuantity < smallInventory.threshold) {
          newStatus = 'low_stock';
        } else {
          newStatus = 'in_stock';
        }
        
        updates.push({
          id: smallInventory.id,
          quantity: newQuantity,
          status: newStatus
        });
      }
      
      // Check large balloons (16inch)
      const large = requirements.large || 0;
      if (large > 0) {
        const largeInventory = colorInventory.find(item => item.size === '16inch');
        if (!largeInventory || largeInventory.quantity < large) {
          insufficientItems.push({
            color,
            size: '16inch',
            required: large,
            available: largeInventory ? largeInventory.quantity : 0
          });
          continue;
        }
        
        // Determine the new inventory status based on quantity
        const newQuantity = largeInventory.quantity - large;
        let newStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
        
        if (newQuantity <= 0) {
          newStatus = 'out_of_stock';
        } else if (newQuantity < largeInventory.threshold) {
          newStatus = 'low_stock';
        } else {
          newStatus = 'in_stock';
        }
        
        updates.push({
          id: largeInventory.id,
          quantity: newQuantity,
          status: newStatus
        });
      }
    }
    
    // Check if we have sufficient inventory
    if (insufficientItems.length > 0) {
      return res.status(400).json({
        error: 'Insufficient inventory',
        details: 'Not enough materials in inventory to create this production',
        insufficientItems
      });
    }
    
    // Set default status if not provided
    const productionData = {
      ...req.body,
      status: req.body.status || 'pending'
    };
    
    // Ensure startDate is properly formatted if it's a string
    if (productionData.startDate && typeof productionData.startDate === 'string') {
      try {
        // Create a proper Date object from the string
        productionData.startDate = new Date(productionData.startDate);
        
        // Check if it's a valid date
        if (isNaN(productionData.startDate.getTime())) {
          return res.status(400).json({ 
            error: 'Invalid date format', 
            details: 'The provided start date is not a valid date' 
          });
        }
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid date format', 
          details: 'The provided start date could not be parsed' 
        });
      }
    }
    
    // Validate production data
    const validatedProductionData = insertProductionSchema.parse(productionData);
    
    // Update inventory items
    for (const update of updates) {
      await storage.updateInventoryItem(update.id, {
        quantity: update.quantity,
        status: update.status
      });
    }
    
    // Create the production
    const production = await storage.createProduction(validatedProductionData);
    
    // Return success with production and inventory updates
    res.status(201).json({
      production,
      inventoryUpdated: true,
      materialRequirements: design.materialRequirements
    });
  } catch (error: any) {
    console.error('Error creating production:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid production data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create production' });
  }
});

/**
 * Update a production
 * PATCH /api/production/:id
 * Requires authentication
 */
router.patch('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productionId = parseInt(req.params.id);
    if (isNaN(productionId)) {
      return res.status(400).json({ error: 'Invalid production ID' });
    }
    
    // Get the production to check permissions
    const production = await storage.getProduction(productionId);
    if (!production) {
      return res.status(404).json({ error: 'Production not found' });
    }
    
    // Check if user owns the associated design or is admin
    const design = await storage.getDesign(production.designId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update the production
    const updatedProduction = await storage.updateProduction(productionId, req.body);
    
    res.json(updatedProduction);
  } catch (error) {
    console.error('Error updating production:', error);
    res.status(500).json({ error: 'Failed to update production' });
  }
});

/**
 * Complete a production
 * PATCH /api/production/:id/complete
 * Requires authentication
 */
router.patch('/:id/complete', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productionId = parseInt(req.params.id);
    if (isNaN(productionId)) {
      return res.status(400).json({ error: 'Invalid production ID' });
    }
    
    // Get the production to check permissions
    const production = await storage.getProduction(productionId);
    if (!production) {
      return res.status(404).json({ error: 'Production not found' });
    }
    
    // Check if user owns the associated design or is admin
    const design = await storage.getDesign(production.designId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update the production to completed state
    const updatedProduction = await storage.updateProduction(productionId, {
      status: 'completed',
      completionDate: new Date(),
      actualTime: req.body.actualTime || 'Unknown'
    });
    
    res.json(updatedProduction);
  } catch (error) {
    console.error('Error completing production:', error);
    res.status(500).json({ error: 'Failed to complete production' });
  }
});

export default router;