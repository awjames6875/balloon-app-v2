import { Router, Request, Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Mock data storage for payment intents
const paymentIntents = new Map();
let paymentIntentIdCounter = 1;

/**
 * Get all payment intents for the authenticated user
 * Admin users can see all payment intents
 */
router.get('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Return all payment intents (filtered by user)
    const intents = Array.from(paymentIntents.values()).filter(intent => 
      req.userRole === 'admin' || intent.userId === req.userId
    );
    res.json(intents);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

/**
 * Create a new payment intent
 */
router.post('/create-intent', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, designId, clientName } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    // Create a mock payment intent
    const paymentIntent = {
      id: `pi_${paymentIntentIdCounter++}`,
      amount,
      currency: 'usd',
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: req.userId,
      designId,
      clientName: clientName || 'Unknown Client'
    };
    
    // Store the payment intent
    paymentIntents.set(paymentIntent.id, paymentIntent);
    
    res.status(201).json(paymentIntent);
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

/**
 * Complete a payment intent
 */
router.post('/:id/complete', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the payment intent
    const paymentIntent = paymentIntents.get(id);
    
    if (!paymentIntent) {
      return res.status(404).json({ message: 'Payment intent not found' });
    }
    
    // Check if the user owns this payment intent or is admin
    if (paymentIntent.userId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update payment status
    paymentIntent.status = 'completed';
    paymentIntents.set(id, paymentIntent);
    
    res.json(paymentIntent);
  } catch (error) {
    console.error('Complete payment error:', error);
    res.status(500).json({ message: 'Failed to complete payment' });
  }
});

export default router;