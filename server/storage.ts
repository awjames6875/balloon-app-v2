import { 
  users, type User, type InsertUser,
  designs, type Design, type InsertDesign,
  inventory, type Inventory, type InsertInventory,
  accessories, type Accessory, type InsertAccessory,
  production, type Production, type InsertProduction,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
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
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByDesign(designId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    console.log("DatabaseStorage initialized - Consider using repositories directly");
  }

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
    // Ensure elements is handled properly as JSON
    let elementsData = design.elements;
    
    // Debugging info
    console.log('Elements type:', typeof elementsData);
    
    // Handle the case where elements might be a string (already stringified JSON)
    if (typeof elementsData === 'string') {
      try {
        // Try to parse it as JSON
        elementsData = JSON.parse(elementsData);
        console.log('Successfully parsed elements from string to array');
      } catch (e) {
        // If parsing fails, use an empty array as a fallback
        console.error('Failed to parse elements string:', e);
        elementsData = [];
      }
    } else if (!elementsData) {
      // If elements is null or undefined, use an empty array
      elementsData = [];
    }
    
    // Create a new object without the elements field
    const { elements, ...designWithoutElements } = design;
    
    // Create the design with properly handled elements added separately to avoid type errors
    const designData = {
      ...designWithoutElements
    };
    
    // Add the elements field directly to avoid TypeScript errors
    (designData as any).elements = elementsData;
    
    const [newDesign] = await db.insert(designs).values(designData).returning();
    
    return newDesign;
  }

  async updateDesign(id: number, updatedDesign: Partial<Design>): Promise<Design | undefined> {
    // Handle elements field properly if it exists in the update
    if (updatedDesign.elements !== undefined) {
      let elementsData = updatedDesign.elements;
      
      // Handle the case where elements might be a string (already stringified JSON)
      if (typeof elementsData === 'string') {
        try {
          // Try to parse it as JSON
          elementsData = JSON.parse(elementsData);
          console.log('Successfully parsed elements from string to array in update');
        } catch (e) {
          // If parsing fails, keep it as is
          console.error('Failed to parse elements string in update:', e);
        }
      }
      
      // Update the elements field with properly processed data
      updatedDesign = {
        ...updatedDesign,
        elements: elementsData
      };
    }
    
    // Perform the update
    const [design] = await db.update(designs)
      .set({
        ...updatedDesign,
        updatedAt: new Date(),
      })
      .where(eq(designs.id, id))
      .returning();
    
    return design || undefined;
  }

  async deleteDesign(id: number): Promise<boolean> {
    const result = await db.delete(designs).where(eq(designs.id, id));
    return result.rowCount > 0;
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.color, color as any));
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    const [updatedItem] = await db.update(inventory)
      .set({
        ...item,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, id))
      .returning();
    return updatedItem || undefined;
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

  async updateAccessory(id: number, update: Partial<Accessory>): Promise<Accessory | undefined> {
    const [updatedAccessory] = await db.update(accessories)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(accessories.id, id))
      .returning();
    return updatedAccessory || undefined;
  }

  async getProduction(id: number): Promise<Production | undefined> {
    const [prod] = await db.select().from(production).where(eq(production.id, id));
    return prod || undefined;
  }

  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return await db.select().from(production).where(eq(production.designId, designId));
  }

  async createProduction(prod: InsertProduction): Promise<Production> {
    const [newProduction] = await db.insert(production).values(prod).returning();
    return newProduction;
  }

  async updateProduction(id: number, update: Partial<Production>): Promise<Production | undefined> {
    const [updated] = await db.update(production)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(production.id, id))
      .returning();
    return updated || undefined;
  }

  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    await db.insert(designAccessories).values({
      designId,
      accessoryId,
      quantity
    });
  }

  async getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    const result = await db.select()
      .from(designAccessories)
      .where(eq(designAccessories.designId, designId))
      .innerJoin(accessories, eq(designAccessories.accessoryId, accessories.id));

    return result.map(item => ({
      accessory: item.accessories,
      quantity: item.design_accessories.quantity
    }));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrdersByDesign(designId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.designId, designId));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: number, update: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return updated || undefined;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async addOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }
}

export const storage = new DatabaseStorage();