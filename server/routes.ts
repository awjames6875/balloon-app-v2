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
  insertProductionSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
// AI import removed
import { pool } from "./db";
import connectPg from "connect-pg-simple";

// Import the route registration function
import { registerRoutes as registerModularRoutes } from './routes/index';

// Import session types
import "./types";

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
  
  // Create a design with elements and background
  app.post('/api/designs/create', isAuthenticated, async (req, res) => {
    const { clientName = 'Anonymous Client', eventDate, elements = [], backgroundUrl, notes } = req.body;
    const userId = req.session.userId!;
    
    try {
      console.log('Creating design with elements:', elements.length);
      
      const design = await storage.createDesign({
        userId,
        clientName,
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        elements: JSON.stringify(elements || []) as any, // Type casting to avoid TS error
        backgroundUrl: backgroundUrl || null,
        notes: notes || '',
      });
      
      console.log('Design created successfully:', design.id);
      res.json(design);
    } catch (error) {
      console.error('Error creating design:', error);
      res.status(500).json({ message: 'Error creating design' });
    }
  });
  
  // Save material requirements to inventory
  app.post('/api/designs/:id/save-to-inventory', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const { materialCounts } = req.body;
      
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }
      
      // Check if design exists
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user has permission to access this design
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get all inventory
      const inventory = await storage.getAllInventory();
      
      // Update inventory with the required materials
      for (const [colorName, counts] of Object.entries(materialCounts)) {
        const colorInventory = inventory.filter(item => 
          item.color.toLowerCase() === colorName.toLowerCase()
        );
        
        // @ts-ignore - TS doesn't know the structure of counts
        const smallBalloons = counts.small || 0;
        // @ts-ignore
        const largeBalloons = counts.large || 0;
        
        // Add/update small balloons (11inch) inventory
        let smallInventory = colorInventory.find(item => item.size === '11inch');
        if (smallInventory) {
          await storage.updateInventoryItem(smallInventory.id, {
            quantity: smallInventory.quantity + smallBalloons
          });
        } else {
          // Create a new inventory item
          await storage.createInventoryItem({
            color: colorName.toLowerCase() as any, // Convert to lowercase to match enum
            size: '11inch',
            quantity: smallBalloons,
            threshold: 20 // Default threshold instead of status which isn't in the schema
          });
        }
        
        // Add/update large balloons (16inch) inventory
        let largeInventory = colorInventory.find(item => item.size === '16inch');
        if (largeInventory) {
          await storage.updateInventoryItem(largeInventory.id, {
            quantity: largeInventory.quantity + largeBalloons
          });
        } else {
          // Create a new inventory item
          await storage.createInventoryItem({
            color: colorName.toLowerCase() as any, // Convert to lowercase to match enum
            size: '16inch',
            quantity: largeBalloons,
            threshold: 20 // Default threshold instead of status which isn't in the schema
          });
        }
      }
      
      res.json({ 
        success: true,
        message: 'Inventory successfully updated'
      });
      
    } catch (error) {
      console.error('Save to inventory error:', error);
      res.status(500).json({ message: 'Failed to update inventory' });
    }
  });
  
  // Check inventory availability for a design
  app.post('/api/designs/:id/check-inventory', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      const { materialCounts } = req.body;
      
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }
      
      // Check if design exists
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if user has permission to access this design
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get all inventory
      const inventory = await storage.getAllInventory();
      
      // Check material requirements against inventory
      const missingItems: string[] = [];
      let isAvailable = true;
      
      for (const [colorName, counts] of Object.entries(materialCounts)) {
        const colorInventory = inventory.filter(item => 
          item.color.toLowerCase() === colorName.toLowerCase()
        );
        
        // @ts-ignore - TS doesn't know the structure of counts
        const smallBalloons = counts.small || 0;
        // @ts-ignore
        const largeBalloons = counts.large || 0;
        
        // Check small balloons (11inch)
        const smallInventory = colorInventory.find(item => item.size === '11inch');
        if (!smallInventory || smallInventory.quantity < smallBalloons) {
          missingItems.push(`${colorName} (11inch)`);
          isAvailable = false;
        }
        
        // Check large balloons (16inch)
        const largeInventory = colorInventory.find(item => item.size === '16inch');
        if (!largeInventory || largeInventory.quantity < largeBalloons) {
          missingItems.push(`${colorName} (16inch)`);
          isAvailable = false;
        }
      }
      
      res.json({ 
        available: isAvailable,
        missingItems: missingItems.length > 0 ? missingItems : undefined
      });
      
    } catch (error) {
      console.error('Check inventory error:', error);
      res.status(500).json({ message: 'Failed to check inventory' });
    }
  });
  
  // Generate a production form from a design
  app.post('/api/designs/:id/generate-production', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }
      
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      const { clientName, eventDate, eventType, balloonCounts } = req.body;
      
      if (!balloonCounts) {
        return res.status(400).json({ message: 'Balloon counts are required for production' });
      }
      
      // Format the notes field with balloon requirements
      let notes = `Event Type: ${eventType || 'N/A'}\n\nBalloon Requirements:\n`;
      
      for (const [color, counts] of Object.entries(balloonCounts)) {
        const colorCounts = counts as { small: number, large: number, total: number };
        notes += `- ${color}: ${colorCounts.total} balloons (${colorCounts.small} small, ${colorCounts.large} large)\n`;
      }
      
      // Create a production record
      const productionData = {
        designId: designId,
        status: 'pending',
        startDate: new Date(),
        estimatedCompletionDate: eventDate ? new Date(eventDate) : null,
        notes: notes
      };
      
      const production = await storage.createProduction(productionData);
      
      return res.status(201).json(production);
    } catch (error) {
      console.error('Generate production error:', error);
      return res.status(500).json({ message: 'Failed to generate production form' });
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

  // AI analysis endpoint removed
  
  // AI design modification endpoint removed

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
  
  app.get('/api/inventory/check', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.query.designId as string);
      
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }
      
      // Check if design exists
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Get all inventory
      const inventory = await storage.getAllInventory();
      
      // Check if the design has material requirements
      if (!design.materialRequirements) {
        return res.status(200).json({ status: 'unavailable', message: 'No material requirements found for this design' });
      }
      
      // Compare material requirements with inventory
      let status = 'available';
      const materialReqs = design.materialRequirements;
      
      for (const [color, requirements] of Object.entries(materialReqs as Record<string, any>)) {
        const inventoryItems = inventory.filter(item => item.color.toLowerCase() === color.toLowerCase());
        
        if (inventoryItems.length === 0) {
          status = 'unavailable';
          break;
        }
        
        // Check if small balloons are available
        const smallBalloons = inventoryItems.find(item => item.size === '11inch');
        if (!smallBalloons || smallBalloons.quantity < requirements.small) {
          status = smallBalloons ? 'low' : 'unavailable';
          if (status === 'unavailable') break;
        }
        
        // Check if large balloons are available
        const largeBalloons = inventoryItems.find(item => item.size === '16inch');
        if (!largeBalloons || largeBalloons.quantity < requirements.large) {
          status = largeBalloons ? 'low' : 'unavailable';
          if (status === 'unavailable') break;
        }
      }
      
      res.json({ status, designId });
    } catch (error) {
      console.error('Check inventory error:', error);
      res.status(500).json({ message: 'Failed to check inventory status' });
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

  // Commented out duplicate route to avoid conflict with the first implementation
  /* app.post('/api/designs/:id/save-to-inventory', isAuthenticated, hasRole(['admin', 'inventory_manager']), async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      
      // Get the design
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Get all inventory
      const allInventory = await storage.getAllInventory();
      
      // Extract balloon counts from the design
      const { materialCounts } = req.body;
      
      if (!materialCounts || Object.keys(materialCounts).length === 0) {
        return res.status(400).json({ message: 'No material counts provided' });
      }
      
      // Process each color
      for (const [colorName, counts] of Object.entries(materialCounts)) {
        const { small, large } = counts as { small: number, large: number };
        
        // Map color name to database color (lowercase)
        // Convert to one of the allowable color enum values
        const colorMapping: Record<string, "red" | "blue" | "green" | "yellow" | "purple" | "pink" | "orange" | "white" | "black" | "silver" | "gold"> = {
          'Red': 'red',
          'Pink': 'pink',
          'Purple': 'purple',
          'Deep Purple': 'purple',
          'Indigo': 'blue',
          'Blue': 'blue',
          'Light Blue': 'blue',
          'Teal': 'green',
          'Green': 'green',
          'Light Green': 'green',
          'Lime': 'green',
          'Yellow': 'yellow',
          'Amber': 'yellow',
          'Orange': 'orange',
          'Deep Orange': 'orange',
          'Brown': 'black',
          'white': 'white',
          'black': 'black',
          'silver': 'silver',
          'gold': 'gold'
        };
        
        // Default to red if the color name can't be mapped
        const dbColor = colorMapping[colorName] || 'red';
        
        // Find matching inventory items
        const smallItems = allInventory.filter(item => 
          item.color === dbColor && item.size === '11inch'
        );
        
        const largeItems = allInventory.filter(item => 
          item.color === dbColor && item.size === '16inch'
        );
        
        // Update inventory or create new items if needed
        if (smallItems.length > 0) {
          // Add to existing inventory
          await storage.updateInventoryItem(smallItems[0].id, {
            quantity: smallItems[0].quantity + small
          });
        } else if (small > 0) {
          // Create new inventory item
          await storage.createInventoryItem({
            color: dbColor,
            size: '11inch',
            quantity: small,
            threshold: 20
          });
        }
        
        if (largeItems.length > 0) {
          // Add to existing inventory
          await storage.updateInventoryItem(largeItems[0].id, {
            quantity: largeItems[0].quantity + large
          });
        } else if (large > 0) {
          // Create new inventory item
          await storage.createInventoryItem({
            color: dbColor,
            size: '16inch',
            quantity: large,
            threshold: 20
          });
        }
      }
      
      res.status(200).json({ 
        message: 'Design materials saved to inventory',
        designId 
      });
    } catch (error) {
      console.error('Save to inventory error:', error);
      res.status(500).json({ message: 'Failed to save materials to inventory' });
    }
  }); */

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Add the current user ID to the order data
      const fullOrderData = {
        ...orderData,
        userId: req.session.userId!,
        status: 'pending' // Default status for new orders
      };
      
      const order = await storage.createOrder(fullOrderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(400).json({ message: 'Failed to create order' });
    }
  });
  
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      // Get orders for the current user
      const orders = await storage.getOrdersByUser(req.session.userId!);
      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });
  
  app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if the user owns this order or is an admin
      if (order.userId !== req.session.userId && req.session.userRole !== 'admin') {
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
  
  app.patch('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if the user owns this order or is an admin
      if (order.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update order
      const updatedOrder = await storage.updateOrder(orderId, req.body);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ message: 'Failed to update order' });
    }
  });
  
  app.post('/api/orders/:id/items', isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if the user owns this order or is an admin
      if (order.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Parse and validate order item data
      const orderItemData = insertOrderItemSchema.parse({
        ...req.body,
        orderId
      });
      
      // Create order item
      const orderItem = await storage.addOrderItem(orderItemData);
      res.status(201).json(orderItem);
    } catch (error) {
      console.error('Add order item error:', error);
      res.status(400).json({ message: 'Failed to add order item' });
    }
  });
  
  app.post('/api/designs/:id/order', isAuthenticated, async (req, res) => {
    try {
      const designId = parseInt(req.params.id);
      if (isNaN(designId)) {
        return res.status(400).json({ message: 'Invalid design ID' });
      }
      
      const design = await storage.getDesign(designId);
      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }
      
      // Check if the user owns this design or is an admin
      if (design.userId !== req.session.userId && req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Create order for this design
      const { notes, supplierName, priority, expectedDeliveryDate, items } = req.body;
      
      const orderData = {
        userId: req.session.userId!,
        designId,
        status: 'pending',
        notes: notes || `Order for design: ${design.clientName}`,
        supplierName: supplierName || 'Default Supplier',
        priority: priority || 'normal',
        expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // Default to 1 week from now
      };
      
      const order = await storage.createOrder(orderData);
      
      // If custom items are sent, use them instead of material requirements
      if (items && Array.isArray(items) && items.length > 0) {
        console.log("Using custom items for order:", items);
        
        for (const item of items) {
          // Convert prices to cents (integers) to match the database schema
          const unitPrice = Math.round((item.unitPrice || (item.size === '11inch' ? 0.5 : 0.75)) * 100);
          const subtotal = Math.round(item.quantity * unitPrice);
          
          await storage.addOrderItem({
            orderId: order.id,
            inventoryType: 'balloon',
            color: item.color.toLowerCase() as any, // Cast to colorEnum type
            size: item.size,
            quantity: item.quantity,
            unitPrice: unitPrice, 
            subtotal: subtotal
          });
        }
      }
      // Otherwise, if the design has material requirements, add them as order items
      else if (design.materialRequirements && Object.keys(design.materialRequirements).length > 0) {
        console.log("Using material requirements for order:", design.materialRequirements);
        
        for (const [color, requirements] of Object.entries(design.materialRequirements)) {
          // Add small balloons as an order item
          if (requirements.small > 0) {
            // Convert prices to cents (integers) to match the database schema
            const unitPrice = Math.round(0.5 * 100); // 50 cents per small balloon
            const subtotal = Math.round(requirements.small * unitPrice);
            
            await storage.addOrderItem({
              orderId: order.id,
              inventoryType: 'balloon',
              color: color.toLowerCase() as any, // Cast to colorEnum type
              size: '11inch',
              quantity: requirements.small,
              unitPrice: unitPrice,
              subtotal: subtotal
            });
          }
          
          // Add large balloons as an order item
          if (requirements.large > 0) {
            // Convert prices to cents (integers) to match the database schema
            const unitPrice = Math.round(0.75 * 100); // 75 cents per large balloon
            const subtotal = Math.round(requirements.large * unitPrice);
            
            await storage.addOrderItem({
              orderId: order.id,
              inventoryType: 'balloon',
              color: color.toLowerCase() as any, // Cast to colorEnum type
              size: '16inch',
              quantity: requirements.large,
              unitPrice: unitPrice,
              subtotal: subtotal
            });
          }
        }
      }
      
      // Get all order items
      const orderItems = await storage.getOrderItems(order.id);
      
      // Calculate total cost (already in cents)
      const totalCost = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      // Update order with total cost
      const updatedOrder = await storage.updateOrder(order.id, {
        totalCost,
        totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0)
      });
      
      // Update inventory with the ordered items
      const allInventory = await storage.getAllInventory();
      const updatedInventoryItems = [];
      
      // Process each order item and update inventory
      for (const item of orderItems) {
        if (item.inventoryType === 'balloon') {
          // Get inventory for this color and size
          const matchingInventory = allInventory.find(
            inv => inv.color.toLowerCase() === item.color.toLowerCase() && inv.size === item.size
          );
          
          if (matchingInventory) {
            // Update existing inventory with the ordered quantity
            const newQuantity = matchingInventory.quantity + item.quantity;
            console.log(`Updating ${item.color} ${item.size} inventory from ${matchingInventory.quantity} to ${newQuantity}`);
            
            // Calculate new status based on quantity and threshold
            let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
            if (newQuantity <= 0) {
              status = 'out_of_stock';
            } else if (newQuantity < matchingInventory.threshold) {
              status = 'low_stock';
            }
            
            await storage.updateInventoryItem(matchingInventory.id, {
              quantity: newQuantity,
              status: status
            });
            
            updatedInventoryItems.push({
              color: item.color,
              size: item.size,
              previousQuantity: matchingInventory.quantity,
              newQuantity: newQuantity
            });
          } else {
            // Create new inventory item since it doesn't exist
            console.log(`Creating new ${item.color} ${item.size} inventory with quantity ${item.quantity}`);
            
            // Set default threshold and status
            const threshold = 20; // Default threshold
            let status = 'in_stock';
            if (item.quantity <= 0) {
              status = 'out_of_stock';
            } else if (item.quantity < threshold) {
              status = 'low_stock';
            }
            
            const newInventoryItem = await storage.createInventoryItem({
              color: item.color.toLowerCase() as any,
              size: item.size,
              quantity: item.quantity,
              threshold: threshold,
              status: status
            });
            
            updatedInventoryItems.push({
              color: item.color,
              size: item.size,
              previousQuantity: 0,
              newQuantity: item.quantity
            });
          }
        }
      }
      
      res.status(201).json({
        ...updatedOrder,
        items: orderItems,
        inventoryUpdated: true,
        updatedInventoryItems
      });
    } catch (error) {
      console.error('Create design order error:', error);
      res.status(400).json({ message: 'Failed to create order for design' });
    }
  });
  
  // Register all modular routes
  registerModularRoutes(app);

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
