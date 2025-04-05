import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertUserSchema, 
  insertDesignSchema, 
  insertInventorySchema, 
  insertAccessorySchema,
  insertProductionSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import { analyzeDesignImage } from "./ai";
import { pool } from "./db";
import connectPg from "connect-pg-simple";

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize PostgreSQL session store
  const PostgresStore = connectPg(session);
  
  // Session setup for authentication
  app.use(session({
    store: new PostgresStore({
      pool,
      tableName: 'session', // Use this table for session storage
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'balloon-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Auth Middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
  };

  // Check if user has specified role
  const hasRole = (roles: string[]) => {
    return async (req: Request, res: Response, next: Function) => {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      next();
    };
  };

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(data.username);
      const existingEmail = await storage.getUserByEmail(data.email);
      
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create new user with hashed password
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error occurred' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });

  // Design routes
  app.post('/api/designs', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
      const imageFile = req.file;
      const designData = req.body;
      
      if (!imageFile) {
        return res.status(400).json({ message: 'Design image is required' });
      }
      
      // Create design record
      const design = await storage.createDesign({
        userId: req.session.userId!,
        clientName: designData.clientName,
        eventDate: designData.eventDate,
        dimensions: designData.dimensions,
        notes: designData.notes,
        imageUrl: `/uploads/${imageFile.filename}`
      });
      
      res.status(201).json(design);
    } catch (error) {
      console.error('Design upload error:', error);
      res.status(400).json({ message: 'Failed to upload design' });
    }
  });

  app.get('/api/designs', isAuthenticated, async (req, res) => {
    try {
      const designs = await storage.getDesignsByUser(req.session.userId!);
      res.json(designs);
    } catch (error) {
      console.error('Get designs error:', error);
      res.status(500).json({ message: 'Failed to fetch designs' });
    }
  });

  app.get('/api/designs/:id', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const design = await storage.getDesign(designId);
      
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(design);
    } catch (error) {
      console.error('Get design error:', error);
      res.status(500).json({ message: 'Failed to fetch design' });
    }
  });

  app.patch('/api/designs/:id', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const design = await storage.getDesign(designId);
      
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update the design
      const updatedDesign = await storage.updateDesign(designId, {
        ...req.body,
        updatedAt: new Date()
      });
      
      if (!updatedDesign) {
        return res.status(500).json({ message: 'Failed to update design' });
      }
      
      res.json(updatedDesign);
    } catch (error) {
      console.error('Update design error:', error);
      res.status(500).json({ message: 'Failed to update design' });
    }
  });

  app.post('/api/designs/:id/analyze', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const design = await storage.getDesign(designId);
      
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      if (!design.imageUrl) {
        return res.status(400).json({ message: 'Design has no image to analyze' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Analyze image using AI
      const imagePath = path.join(process.cwd(), design.imageUrl.replace(/^\//, ''));
      const analysis = await analyzeDesignImage(imagePath);
      
      // Update design with analysis results
      const updatedDesign = await storage.updateDesign(designId, {
        colorAnalysis: analysis.colorAnalysis,
        materialRequirements: analysis.materialRequirements,
        totalBalloons: analysis.totalBalloons,
        estimatedClusters: analysis.estimatedClusters,
        productionTime: analysis.productionTime
      });
      
      res.json(updatedDesign);
    } catch (error) {
      console.error('Design analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze design' });
    }
  });

  app.put('/api/designs/:id', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const design = await storage.getDesign(designId);
      
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updatedDesign = await storage.updateDesign(designId, req.body);
      
      res.json(updatedDesign);
    } catch (error) {
      console.error('Update design error:', error);
      res.status(400).json({ message: 'Failed to update design' });
    }
  });

  app.delete('/api/designs/:id', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const design = await storage.getDesign(designId);
      
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Delete image file if exists
      if (design.imageUrl) {
        const imagePath = path.join(process.cwd(), design.imageUrl.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      await storage.deleteDesign(designId);
      
      res.json({ message: 'Design deleted successfully' });
    } catch (error) {
      console.error('Delete design error:', error);
      res.status(500).json({ message: 'Failed to delete design' });
    }
  });

  // Inventory routes
  app.get('/api/inventory', isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      res.json(inventory);
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({ message: 'Failed to fetch inventory' });
    }
  });

  app.post('/api/inventory', isAuthenticated, hasRole(['admin', 'inventory_manager']), async (req, res) => {
    try {
      const data = insertInventorySchema.parse(req.body);
      
      const inventoryItem = await storage.createInventoryItem(data);
      
      res.status(201).json(inventoryItem);
    } catch (error) {
      console.error('Create inventory error:', error);
      res.status(400).json({ message: 'Failed to create inventory item' });
    }
  });

  app.put('/api/inventory/:id', isAuthenticated, hasRole(['admin', 'inventory_manager']), async (req, res) => {
    try {
      const inventoryId = parseInt(req.params.id);
      const inventoryItem = await storage.getInventoryItem(inventoryId);
      
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      const updatedItem = await storage.updateInventoryItem(inventoryId, req.body);
      
      res.json(updatedItem);
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(400).json({ message: 'Failed to update inventory item' });
    }
  });

  // Accessories routes
  app.get('/api/accessories', isAuthenticated, async (req, res) => {
    try {
      const accessories = await storage.getAllAccessories();
      res.json(accessories);
    } catch (error) {
      console.error('Get accessories error:', error);
      res.status(500).json({ message: 'Failed to fetch accessories' });
    }
  });

  app.post('/api/accessories', isAuthenticated, hasRole(['admin', 'inventory_manager']), async (req, res) => {
    try {
      const data = insertAccessorySchema.parse(req.body);
      
      const accessory = await storage.createAccessory(data);
      
      res.status(201).json(accessory);
    } catch (error) {
      console.error('Create accessory error:', error);
      res.status(400).json({ message: 'Failed to create accessory' });
    }
  });

  app.put('/api/accessories/:id', isAuthenticated, hasRole(['admin', 'inventory_manager']), async (req, res) => {
    try {
      const accessoryId = parseInt(req.params.id);
      const accessory = await storage.getAccessory(accessoryId);
      
      if (!accessory) {
        return res.status(404).json({ message: 'Accessory not found' });
      }
      
      const updatedAccessory = await storage.updateAccessory(accessoryId, req.body);
      
      res.json(updatedAccessory);
    } catch (error) {
      console.error('Update accessory error:', error);
      res.status(400).json({ message: 'Failed to update accessory' });
    }
  });

  // Design accessories routes
  app.post('/api/designs/:id/accessories', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const { accessoryId, quantity } = req.body;
      
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const accessory = await storage.getAccessory(accessoryId);
      if (!accessory) {
        return res.status(404).json({ message: 'Accessory not found' });
      }
      
      await storage.addAccessoryToDesign(designId, accessoryId, quantity);
      
      const designAccessories = await storage.getDesignAccessories(designId);
      
      res.status(201).json(designAccessories);
    } catch (error) {
      console.error('Add design accessory error:', error);
      res.status(400).json({ message: 'Failed to add accessory to design' });
    }
  });

  app.get('/api/designs/:id/accessories', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user can access this design
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const accessories = await storage.getDesignAccessories(designId);
      
      res.json(accessories);
    } catch (error) {
      console.error('Get design accessories error:', error);
      res.status(500).json({ message: 'Failed to fetch design accessories' });
    }
  });

  // Production routes
  app.post('/api/production', isAuthenticated, async (req, res) => {
    try {
      const data = insertProductionSchema.parse(req.body);
      
      // Check if design exists
      const design = await storage.getDesign(data.designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user owns this design or is admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const production = await storage.createProduction(data);
      
      res.status(201).json(production);
    } catch (error) {
      console.error('Create production error:', error);
      res.status(400).json({ message: 'Failed to create production record' });
    }
  });

  app.get('/api/production/:id', isAuthenticated, async (req, res) => {
    try {
      const productionId = parseInt(req.params.id);
      
      const production = await storage.getProduction(productionId);
      if (!production) {
        return res.status(404).json({ message: 'Production record not found' });
      }
      
      // Check if user can access this production record
      const design = await storage.getDesign(production.designId);
      if (design && design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(production);
    } catch (error) {
      console.error('Get production error:', error);
      res.status(500).json({ message: 'Failed to fetch production record' });
    }
  });

  app.put('/api/production/:id', isAuthenticated, async (req, res) => {
    try {
      const productionId = parseInt(req.params.id);
      
      const production = await storage.getProduction(productionId);
      if (!production) {
        return res.status(404).json({ message: 'Production record not found' });
      }
      
      // Check if user can update this production record
      const design = await storage.getDesign(production.designId);
      if (design && design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updatedProduction = await storage.updateProduction(productionId, req.body);
      
      res.json(updatedProduction);
    } catch (error) {
      console.error('Update production error:', error);
      res.status(400).json({ message: 'Failed to update production record' });
    }
  });

  // Payment routes
  // Mock data storage
  const paymentIntents = new Map();
  let paymentIntentIdCounter = 1;

  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      // Return all payment intents (in a real app, filter by user)
      const intents = Array.from(paymentIntents.values()).filter(intent => 
        req.session.userRole === 'admin' || intent.userId === req.session.userId
      );
      res.json(intents);
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  app.post('/api/payments/create-intent', isAuthenticated, async (req, res) => {
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
        userId: req.session.userId,
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

  app.post('/api/payments/:id/complete', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the payment intent
      const paymentIntent = paymentIntents.get(id);
      
      if (!paymentIntent) {
        return res.status(404).json({ message: 'Payment intent not found' });
      }
      
      // Check if user has access to this payment
      if (paymentIntent.userId !== req.session.userId && req.session.userRole !== 'admin') {
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

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}
