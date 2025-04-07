import { DesignDatabaseStorage } from './design';
import { InventoryDatabaseStorage } from './inventory';
import { AccessoryDatabaseStorage } from './accessory';
import { ProductionDatabaseStorage } from './production';
import { OrderDatabaseStorage } from './order';
import { IStorage } from '../interfaces';
import { User, InsertUser, Design, InsertDesign, Inventory, InsertInventory, 
         Accessory, InsertAccessory, Production, InsertProduction, 
         Order, InsertOrder, OrderItem, InsertOrderItem } from '@shared/schema';
import { db } from '../../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  private designStorage: DesignDatabaseStorage;
  private inventoryStorage: InventoryDatabaseStorage;
  private accessoryStorage: AccessoryDatabaseStorage;
  private productionStorage: ProductionDatabaseStorage;
  private orderStorage: OrderDatabaseStorage;

  constructor() {
    this.designStorage = new DesignDatabaseStorage();
    this.inventoryStorage = new InventoryDatabaseStorage();
    this.accessoryStorage = new AccessoryDatabaseStorage();
    this.productionStorage = new ProductionDatabaseStorage();
    this.orderStorage = new OrderDatabaseStorage();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Design operations delegated to DesignDatabaseStorage
  async getDesign(id: number): Promise<Design | undefined> {
    return this.designStorage.getDesign(id);
  }

  async getDesignsByUser(userId: number): Promise<Design[]> {
    return this.designStorage.getDesignsByUser(userId);
  }

  async createDesign(design: InsertDesign): Promise<Design> {
    return this.designStorage.createDesign(design);
  }

  async updateDesign(id: number, design: Partial<Design>): Promise<Design | undefined> {
    return this.designStorage.updateDesign(id, design);
  }

  async deleteDesign(id: number): Promise<boolean> {
    return this.designStorage.deleteDesign(id);
  }

  // Inventory operations delegated to InventoryDatabaseStorage
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventoryStorage.getInventoryItem(id);
  }

  async getAllInventory(): Promise<Inventory[]> {
    return this.inventoryStorage.getAllInventory();
  }

  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return this.inventoryStorage.getInventoryByColor(color);
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    return this.inventoryStorage.createInventoryItem(item);
  }

  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    return this.inventoryStorage.updateInventoryItem(id, item);
  }

  // Accessory operations delegated to AccessoryDatabaseStorage
  async getAccessory(id: number): Promise<Accessory | undefined> {
    return this.accessoryStorage.getAccessory(id);
  }

  async getAllAccessories(): Promise<Accessory[]> {
    return this.accessoryStorage.getAllAccessories();
  }

  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    return this.accessoryStorage.createAccessory(accessory);
  }

  async updateAccessory(id: number, accessory: Partial<Accessory>): Promise<Accessory | undefined> {
    return this.accessoryStorage.updateAccessory(id, accessory);
  }

  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    return this.accessoryStorage.addAccessoryToDesign(designId, accessoryId, quantity);
  }

  async getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    return this.accessoryStorage.getDesignAccessories(designId);
  }

  // Production operations delegated to ProductionDatabaseStorage
  async getProduction(id: number): Promise<Production | undefined> {
    return this.productionStorage.getProduction(id);
  }

  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return this.productionStorage.getProductionsByDesign(designId);
  }

  async createProduction(production: InsertProduction): Promise<Production> {
    return this.productionStorage.createProduction(production);
  }

  async updateProduction(id: number, production: Partial<Production>): Promise<Production | undefined> {
    return this.productionStorage.updateProduction(id, production);
  }

  // Order operations delegated to OrderDatabaseStorage
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orderStorage.getOrder(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderStorage.getOrdersByUser(userId);
  }

  async getOrdersByDesign(designId: number): Promise<Order[]> {
    return this.orderStorage.getOrdersByDesign(designId);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    return this.orderStorage.createOrder(order);
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
    return this.orderStorage.updateOrder(id, order);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderStorage.getOrderItems(orderId);
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    return this.orderStorage.addOrderItem(orderItem);
  }
}