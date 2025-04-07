import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, isAdmin, AuthenticatedRequest } from '../middleware/auth.middleware';
import { insertProductionSchema } from '@shared/schema';

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
    
    // Set default status if not provided
    const productionData = {
      ...req.body,
      status: req.body.status || 'pending'
    };
    
    // Validate production data
    const validatedProductionData = insertProductionSchema.parse(productionData);
    
    // Create the production
    const production = await storage.createProduction(validatedProductionData);
    
    res.status(201).json(production);
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