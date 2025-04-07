import { Router, Request, Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';
import { storage } from '../storage';
import { insertOrderSchema, insertOrderItemSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * Get all orders for current user
 * GET /api/orders
 * Requires authentication
 */
router.get('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const orders = await storage.getOrdersByUser(req.userId);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

/**
 * Get all orders for a design
 * GET /api/orders/design/:designId
 * Requires authentication and ownership of the design or admin role
 */
router.get('/design/:designId', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const designId = parseInt(req.params.designId);
    if (isNaN(designId)) {
      return res.status(400).json({ message: 'Invalid design ID' });
    }
    
    // Check if design exists and user has permission to access it
    const design = await storage.getDesign(designId);
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    
    // Check user permission: either owner of the design or admin
    if (design.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const orders = await storage.getOrdersByDesign(designId);
    res.json(orders);
  } catch (error) {
    console.error('Get design orders error:', error);
    res.status(500).json({ message: 'Failed to fetch design orders' });
  }
});

/**
 * Get an order by ID
 * GET /api/orders/:id
 * Requires authentication and ownership of the order or admin role
 */
router.get('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check user permission: either owner of the order or admin
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

/**
 * Create a new order
 * POST /api/orders
 * Requires authentication
 */
router.post('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const data = insertOrderSchema.parse({
      ...req.body,
      userId: req.userId
    });
    
    const order = await storage.createOrder(data);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid order data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Failed to create order' });
  }
});

/**
 * Add an item to an order
 * POST /api/orders/:id/items
 * Requires authentication and ownership of the order or admin role
 */
router.post('/:id/items', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check user permission: either owner of the order or admin
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const data = insertOrderItemSchema.parse({
      ...req.body,
      orderId
    });
    
    // Calculate subtotal
    data.subtotal = data.quantity * data.unitPrice;
    
    const orderItem = await storage.addOrderItem(data);
    
    // Update order total cost
    const orderItems = await storage.getOrderItems(orderId);
    const totalCost = orderItems.reduce((total, item) => total + item.subtotal, 0);
    
    await storage.updateOrder(orderId, {
      totalCost,
      totalQuantity: orderItems.reduce((total, item) => total + item.quantity, 0)
    });
    
    res.status(201).json(orderItem);
  } catch (error) {
    console.error('Add order item error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid order item data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Failed to add order item' });
  }
});

/**
 * Update an order
 * PATCH /api/orders/:id
 * Requires authentication and ownership of the order or admin role
 */
router.patch('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
    
    const order = await storage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check user permission: either owner of the order or admin
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Only allow updating certain fields
    const allowedUpdates = ['status', 'notes', 'supplierName', 'expectedDeliveryDate', 'priority'];
    const updates: Record<string, any> = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid update fields provided' });
    }
    
    const updatedOrder = await storage.updateOrder(orderId, updates);
    
    if (!updatedOrder) {
      return res.status(500).json({ message: 'Failed to update order' });
    }
    
    // Get order items
    const orderItems = await storage.getOrderItems(orderId);
    
    res.json({
      ...updatedOrder,
      items: orderItems
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

/**
 * Create a kid-friendly balloon order
 * POST /api/orders/balloon
 * Requires authentication
 * Simplified interface for children to order balloons
 */
router.post('/balloon', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('New balloon order request:', {
      body: JSON.stringify(req.body),
      userId: req.userId,
      sessionId: req.session.id,
      sessionUserId: req.session.userId,
      sessionUserRole: req.session.userRole,
      userRole: req.userRole
    });

    if (!req.userId) {
      console.error('No userId in authenticated request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate the request data
    const { color, size, quantity, eventName } = req.body;
    
    if (!color || !size || !quantity) {
      console.error('Missing required balloon order fields:', { color, size, quantity });
      return res.status(400).json({ 
        message: 'Missing required information',
        details: 'Please tell us what color, size, and how many balloons you need!'
      });
    }
    
    // Simple validation for child-friendly interface
    if (quantity < 1 || quantity > 100) {
      console.error('Invalid quantity in balloon order:', quantity);
      return res.status(400).json({ 
        message: 'Invalid quantity',
        details: 'Please choose between 1 and 100 balloons'
      });
    }
    
    // Validate color against colorEnum
    const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black', 'silver', 'gold'];
    if (!validColors.includes(color.toLowerCase())) {
      console.error('Invalid color in balloon order:', color);
      return res.status(400).json({
        message: 'Invalid color',
        details: 'Please choose one of our available colors'
      });
    }
    
    // Validate size against balloonSizeEnum
    const validSizes = ['11inch', '16inch'];
    if (!validSizes.includes(size)) {
      console.error('Invalid size in balloon order:', size);
      return res.status(400).json({
        message: 'Invalid size',
        details: 'Please choose either 11 inch or 16 inch balloons'
      });
    }
    
    // Create a simple order with a friendly name based on event
    const orderName = eventName 
      ? `Balloons for ${eventName}`
      : `Balloon order (${color} ${size})`;
    
    // Create the order
    const order = await storage.createOrder({
      userId: req.userId,
      notes: `Kid-friendly order: ${quantity} ${color} ${size} balloons`,
      supplierName: 'Store Inventory',
      priority: 'normal',
      totalQuantity: quantity,
      totalCost: 0 // Will be calculated after adding the item
    });
    
    // Set pricing based on balloon size (simplified for kids)
    const unitPrice = size === '11inch' ? 1.99 : 2.99;
    const subtotal = unitPrice * quantity;
    
    // Add the balloon item to the order
    const orderItem = await storage.addOrderItem({
      orderId: order.id,
      color: color.toLowerCase(),
      size,
      quantity,
      inventoryType: 'balloon',
      unitPrice,
      subtotal
    });
    
    // Update the order with the calculated cost
    await storage.updateOrder(order.id, {
      totalCost: subtotal
    });
    
    // Return a kid-friendly response
    res.status(201).json({
      message: 'Yay! Your balloons have been ordered! 🎈',
      orderId: order.id,
      color,
      size,
      quantity,
      total: `$${subtotal.toFixed(2)}`
    });
    
  } catch (error) {
    console.error('Create balloon order error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for specific error types
    if (error instanceof z.ZodError) {
      console.error('Zod validation error in balloon order:', error.errors);
      return res.status(400).json({
        message: 'There was a problem with your balloon choices',
        details: 'Please check your options and try again'
      });
    }
    
    // Kid-friendly error message
    res.status(500).json({ 
      message: 'Oops! Something went wrong with your balloon order.',
      details: 'Please try again or ask for help'
    });
  }
});

export default router;