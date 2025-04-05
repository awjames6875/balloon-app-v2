import { 
  users, type User, type InsertUser,
  designs, type Design, type InsertDesign,
  inventory, type Inventory, type InsertInventory,
  accessories, type Accessory, type InsertAccessory,
  production as productionTable, type Production, type InsertProduction,
  designAccessories
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Design operations
  getDesign(id: number): Promise<Design | undefined>;
  getDesignsByUser(userId: number): Promise<Design[]>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: number, design: Partial<Design>): Promise<Design | undefined>;
  deleteDesign(id: number): Promise<boolean>;
  
  // Inventory operations
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getAllInventory(): Promise<Inventory[]>;
  getInventoryByColor(color: string): Promise<Inventory[]>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined>;
  
  // Accessory operations
  getAccessory(id: number): Promise<Accessory | undefined>;
  getAllAccessories(): Promise<Accessory[]>;
  createAccessory(accessory: InsertAccessory): Promise<Accessory>;
  updateAccessory(id: number, accessory: Partial<Accessory>): Promise<Accessory | undefined>;
  
  // Production operations
  getProduction(id: number): Promise<Production | undefined>;
  getProductionsByDesign(designId: number): Promise<Production[]>;
  createProduction(production: InsertProduction): Promise<Production>;
  updateProduction(id: number, production: Partial<Production>): Promise<Production | undefined>;
  
  // Design accessories operations
  addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void>;
  getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private designs: Map<number, Design>;
  private inventory: Map<number, Inventory>;
  private accessories: Map<number, Accessory>;
  private production: Map<number, Production>;
  private designAccessoriesMap: Map<number, { accessoryId: number; quantity: number }[]>;
  
  private userIdCounter: number;
  private designIdCounter: number;
  private inventoryIdCounter: number;
  private accessoryIdCounter: number;
  private productionIdCounter: number;
  private designAccessoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.inventory = new Map();
    this.accessories = new Map();
    this.production = new Map();
    this.designAccessoriesMap = new Map();
    
    this.userIdCounter = 1;
    this.designIdCounter = 1;
    this.inventoryIdCounter = 1;
    this.accessoryIdCounter = 1;
    this.productionIdCounter = 1;
    this.designAccessoryIdCounter = 1;
    
    // Initialize with default accessories
    this.initDefaultAccessories();
    this.initDefaultInventory();
  }

  private initDefaultAccessories() {
    const defaultAccessories = [
      { name: "LED Lights", quantity: 50, threshold: 10 },
      { name: "Starbursts", quantity: 30, threshold: 5 },
      { name: "Pearl Garlands", quantity: 8, threshold: 10 },
      { name: "Support Base", quantity: 25, threshold: 5 }
    ];

    defaultAccessories.forEach(acc => {
      this.createAccessory({
        name: acc.name,
        quantity: acc.quantity,
        threshold: acc.threshold
      });
    });
  }

  private initDefaultInventory() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black', 'silver', 'gold'];
    const sizes = ['11inch', '16inch'];

    colors.forEach(color => {
      sizes.forEach(size => {
        this.createInventoryItem({
          color: color as any,
          size: size as any,
          quantity: Math.floor(Math.random() * 100) + 50,
          threshold: 20
        });
      });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: timestamp
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Design operations
  async getDesign(id: number): Promise<Design | undefined> {
    return this.designs.get(id);
  }

  async getDesignsByUser(userId: number): Promise<Design[]> {
    return Array.from(this.designs.values()).filter(design => design.userId === userId);
  }

  async createDesign(design: InsertDesign): Promise<Design> {
    const id = this.designIdCounter++;
    const timestamp = new Date();
    const newDesign: Design = {
      ...design,
      id,
      colorAnalysis: { colors: [] },
      materialRequirements: {},
      totalBalloons: 0,
      estimatedClusters: 0,
      productionTime: '',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.designs.set(id, newDesign);
    return newDesign;
  }

  async updateDesign(id: number, design: Partial<Design>): Promise<Design | undefined> {
    const existingDesign = this.designs.get(id);
    if (!existingDesign) return undefined;

    const updatedDesign = {
      ...existingDesign,
      ...design,
      updatedAt: new Date()
    };
    this.designs.set(id, updatedDesign);
    return updatedDesign;
  }

  async deleteDesign(id: number): Promise<boolean> {
    return this.designs.delete(id);
  }

  // Inventory operations
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async getAllInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(item => item.color === color);
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const id = this.inventoryIdCounter++;
    const timestamp = new Date();
    
    // Determine status based on quantity and threshold
    let status = 'in_stock';
    if (item.quantity <= 0) {
      status = 'out_of_stock';
    } else if (item.quantity <= item.threshold) {
      status = 'low_stock';
    }
    
    const newItem: Inventory = {
      ...item,
      id,
      status: status as any,
      updatedAt: timestamp
    };
    this.inventory.set(id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    const existingItem = this.inventory.get(id);
    if (!existingItem) return undefined;

    // Update status based on quantity and threshold
    let status = existingItem.status;
    const quantity = item.quantity !== undefined ? item.quantity : existingItem.quantity;
    const threshold = item.threshold !== undefined ? item.threshold : existingItem.threshold;
    
    if (quantity <= 0) {
      status = 'out_of_stock';
    } else if (quantity <= threshold) {
      status = 'low_stock';
    } else {
      status = 'in_stock';
    }

    const updatedItem = {
      ...existingItem,
      ...item,
      status: status as any,
      updatedAt: new Date()
    };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }

  // Accessory operations
  async getAccessory(id: number): Promise<Accessory | undefined> {
    return this.accessories.get(id);
  }

  async getAllAccessories(): Promise<Accessory[]> {
    return Array.from(this.accessories.values());
  }

  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const id = this.accessoryIdCounter++;
    const timestamp = new Date();
    
    // Determine status based on quantity and threshold
    let status = 'in_stock';
    if (accessory.quantity <= 0) {
      status = 'out_of_stock';
    } else if (accessory.quantity <= accessory.threshold) {
      status = 'low_stock';
    }
    
    const newAccessory: Accessory = {
      ...accessory,
      id,
      status: status as any,
      updatedAt: timestamp
    };
    this.accessories.set(id, newAccessory);
    return newAccessory;
  }

  async updateAccessory(id: number, accessory: Partial<Accessory>): Promise<Accessory | undefined> {
    const existingAccessory = this.accessories.get(id);
    if (!existingAccessory) return undefined;

    // Update status based on quantity and threshold
    let status = existingAccessory.status;
    const quantity = accessory.quantity !== undefined ? accessory.quantity : existingAccessory.quantity;
    const threshold = accessory.threshold !== undefined ? accessory.threshold : existingAccessory.threshold;
    
    if (quantity <= 0) {
      status = 'out_of_stock';
    } else if (quantity <= threshold) {
      status = 'low_stock';
    } else {
      status = 'in_stock';
    }

    const updatedAccessory = {
      ...existingAccessory,
      ...accessory,
      status: status as any,
      updatedAt: new Date()
    };
    this.accessories.set(id, updatedAccessory);
    return updatedAccessory;
  }

  // Production operations
  async getProduction(id: number): Promise<Production | undefined> {
    return this.production.get(id);
  }

  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return Array.from(this.production.values()).filter(p => p.designId === designId);
  }

  async createProduction(production: InsertProduction): Promise<Production> {
    const id = this.productionIdCounter++;
    const timestamp = new Date();
    const newProduction: Production = {
      ...production,
      id,
      completionDate: null,
      actualTime: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.production.set(id, newProduction);
    return newProduction;
  }

  async updateProduction(id: number, production: Partial<Production>): Promise<Production | undefined> {
    const existingProduction = this.production.get(id);
    if (!existingProduction) return undefined;

    const updatedProduction = {
      ...existingProduction,
      ...production,
      updatedAt: new Date()
    };
    this.production.set(id, updatedProduction);
    return updatedProduction;
  }

  // Design accessories operations
  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    const accessoriesList = this.designAccessoriesMap.get(designId) || [];
    
    // Check if this accessory already exists for this design
    const existingIndex = accessoriesList.findIndex(a => a.accessoryId === accessoryId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      accessoriesList[existingIndex].quantity = quantity;
    } else {
      // Add new entry
      accessoriesList.push({ accessoryId, quantity });
    }
    
    this.designAccessoriesMap.set(designId, accessoriesList);
  }

  async getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    const accessoriesIds = this.designAccessoriesMap.get(designId) || [];
    const result = [];
    
    for (const { accessoryId, quantity } of accessoriesIds) {
      const accessory = await this.getAccessory(accessoryId);
      if (accessory) {
        result.push({ accessory, quantity });
      }
    }
    
    return result;
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getDesign(id: number): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design || undefined;
  }

  async getDesignsByUser(userId: number): Promise<Design[]> {
    return await db.select().from(designs).where(eq(designs.userId, userId));
  }

  async createDesign(design: InsertDesign): Promise<Design> {
    const [newDesign] = await db.insert(designs).values(design).returning();
    return newDesign;
  }

  async updateDesign(id: number, updatedDesign: Partial<Design>): Promise<Design | undefined> {
    const [design] = await db.update(designs)
      .set(updatedDesign)
      .where(eq(designs.id, id))
      .returning();
    return design || undefined;
  }

  async deleteDesign(id: number): Promise<boolean> {
    await db.delete(designs).where(eq(designs.id, id));
    return true;
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getInventoryByColor(color: string): Promise<Inventory[]> {
    // Cast the color to the enum type expected by the database
    return await db.select().from(inventory).where(eq(inventory.color, color as any));
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, updatedItem: Partial<Inventory>): Promise<Inventory | undefined> {
    const [item] = await db.update(inventory)
      .set(updatedItem)
      .where(eq(inventory.id, id))
      .returning();
    return item || undefined;
  }

  async getAccessory(id: number): Promise<Accessory | undefined> {
    const [accessory] = await db.select().from(accessories).where(eq(accessories.id, id));
    return accessory || undefined;
  }

  async getAllAccessories(): Promise<Accessory[]> {
    return await db.select().from(accessories);
  }

  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const [newAccessory] = await db.insert(accessories).values(accessory).returning();
    return newAccessory;
  }

  async updateAccessory(id: number, updatedAccessory: Partial<Accessory>): Promise<Accessory | undefined> {
    const [accessory] = await db.update(accessories)
      .set(updatedAccessory)
      .where(eq(accessories.id, id))
      .returning();
    return accessory || undefined;
  }

  async getProduction(id: number): Promise<Production | undefined> {
    const [production] = await db.select().from(productionTable).where(eq(productionTable.id, id));
    return production || undefined;
  }

  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return await db.select().from(productionTable).where(eq(productionTable.designId, designId));
  }

  async createProduction(prod: InsertProduction): Promise<Production> {
    const [newProduction] = await db.insert(productionTable).values(prod).returning();
    return newProduction;
  }

  async updateProduction(id: number, updatedProduction: Partial<Production>): Promise<Production | undefined> {
    const [prod] = await db.update(productionTable)
      .set(updatedProduction)
      .where(eq(productionTable.id, id))
      .returning();
    return prod || undefined;
  }

  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    await db.insert(designAccessories).values({
      designId,
      accessoryId,
      quantity
    });
  }

  async getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    const result = await db.select({
      accessory: accessories,
      quantity: designAccessories.quantity
    })
    .from(designAccessories)
    .innerJoin(accessories, eq(designAccessories.accessoryId, accessories.id))
    .where(eq(designAccessories.designId, designId));
    
    return result;
  }
}

export const storage = new DatabaseStorage();
