import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { clients, insertClientSchema } from '../../shared/schema';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get all clients
router.get('/', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allClients = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.createdAt));

    res.json(allClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
});

// Get a specific client
router.get('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (client.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Failed to fetch client' });
  }
});

// Create a new client (intake form submission)
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = insertClientSchema.parse(req.body);

    const newClient = await db
      .insert(clients)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log('Client created successfully:', newClient[0].id);
    res.json(newClient[0]);
  } catch (error) {
    console.error('Error creating client:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id);
    const validatedData = insertClientSchema.partial().parse(req.body);

    const updatedClient = await db
      .update(clients)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    if (updatedClient.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(updatedClient[0]);
  } catch (error) {
    console.error('Error updating client:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to update client' });
  }
});

export default router;