import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, isAdmin, isInventoryManager, AuthenticatedRequest } from '../middleware/auth.middleware';
import { insertInventorySchema } from '@shared/schema';

const router = Router();

/**
 * Get all inventory items
 * GET /api/inventory
 * Requires authentication
 */
router.get('/', isAuthenticated, async (_req: Request, res: Response) => {
  try {
    const inventory = await storage.getAllInventory();
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

/**
 * Get an inventory item by ID
 * GET /api/inventory/:id
 * Requires authentication
 */
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid inventory item ID' });
    }
    
    const item = await storage.getInventoryItem(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error getting inventory item:', error);
    res.status(500).json({ error: 'Failed to get inventory item' });
  }
});

/**
 * Get inventory items by color
 * GET /api/inventory/color/:color
 * Requires authentication
 */
router.get('/color/:color', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const color = req.params.color;
    
    // Validate that color is in the allowed list
    const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black', 'silver', 'gold'];
    if (!validColors.includes(color.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid color' });
    }
    
    const items = await storage.getInventoryByColor(color.toLowerCase() as any);
    res.json(items);
  } catch (error) {
    console.error('Error getting inventory by color:', error);
    res.status(500).json({ error: 'Failed to get inventory by color' });
  }
});

/**
 * Create a new inventory item
 * POST /api/inventory
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
    
    // Create the inventory item with status calculation
    const itemData = {
      ...req.body,
      status
    };
    
    // Validate inventory data
    const validatedItemData = insertInventorySchema.parse(itemData);
    
    // Create the inventory item
    const item = await storage.createInventoryItem(validatedItemData);
    
    res.status(201).json(item);
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid inventory data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

/**
 * Update an inventory item
 * PATCH /api/inventory/:id
 * Requires inventory manager or admin role
 */
router.patch('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is inventory manager or admin
    if (req.userRole !== 'inventory_manager' && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const itemId = parseInt(req.params.id);
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid inventory item ID' });
    }
    
    const existingItem = await storage.getInventoryItem(itemId);
    if (!existingItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    // If quantity or threshold changed, recalculate status
    let statusUpdate = {};
    if (req.body.quantity !== undefined || req.body.threshold !== undefined) {
      const quantity = req.body.quantity ?? existingItem.quantity;
      const threshold = req.body.threshold ?? existingItem.threshold;
      
      let status = 'in_stock';
      if (quantity <= 0) {
        status = 'out_of_stock';
      } else if (quantity < threshold) {
        status = 'low_stock';
      }
      
      statusUpdate = { status };
    }
    
    // Update the inventory item
    const updatedItem = await storage.updateInventoryItem(itemId, {
      ...req.body,
      ...statusUpdate
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

/**
 * Get inventory availability for balloon counts
 * POST /api/inventory/check-availability
 * Requires authentication
 */
router.post('/check-availability', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { balloonCounts } = req.body;
    
    if (!balloonCounts || typeof balloonCounts !== 'object') {
      return res.status(400).json({ error: 'Balloon counts are required' });
    }
    
    // Get all inventory
    const inventory = await storage.getAllInventory();
    
    // Check each balloon type/color against inventory
    const result = {
      available: true,
      missingItems: [] as string[],
      inventoryStatus: {} as Record<string, {
        color: string;
        size: string;
        required: number;
        available: number;
        status: 'available' | 'low' | 'unavailable';
      }[]>
    };
    
    // Process each color
    for (const [color, sizes] of Object.entries(balloonCounts)) {
      const sizeData = sizes as Record<string, number>;
      
      // Process each size
      for (const [size, count] of Object.entries(sizeData)) {
        if (size === 'total') continue; // Skip the total count
        
        // Find matching inventory item
        const inventoryItem = inventory.find(item => 
          item.color.toLowerCase() === color.toLowerCase() && 
          item.size === (size === 'small' ? '11inch' : '16inch')
        );
        
        // Create an entry for this balloon type
        const sizeLabel = size === 'small' ? '11inch' : '16inch';
        const entry = {
          color,
          size: sizeLabel,
          required: count,
          available: inventoryItem?.quantity || 0,
          status: 'available' as 'available' | 'low' | 'unavailable'
        };
        
        // Determine status based on availability
        if (!inventoryItem || inventoryItem.quantity < count) {
          entry.status = 'unavailable';
          result.available = false;
          result.missingItems.push(`${color} (${sizeLabel})`);
        } else if (inventoryItem.quantity < inventoryItem.threshold) {
          entry.status = 'low';
        }
        
        // Add to inventory status
        if (!result.inventoryStatus[color]) {
          result.inventoryStatus[color] = [];
        }
        
        result.inventoryStatus[color].push(entry);
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error checking inventory availability:', error);
    res.status(500).json({ error: 'Failed to check inventory availability' });
  }
});

export default router;