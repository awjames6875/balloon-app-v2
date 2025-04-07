import { 
  User, InsertUser, 
  Design, InsertDesign, 
  Inventory, InsertInventory, 
  Accessory, InsertAccessory, 
  Production, InsertProduction, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem
} from '@shared/schema';

import { RepositoryFactory } from './repositories';

/**
 * Interface for all storage operations
 * @deprecated Use individual repositories instead
 */
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

/**
 * Storage implementation that delegates to repositories
 * This class is used to maintain backwards compatibility
 * with existing code while we transition to the repository pattern
 * @deprecated Use individual repositories instead
 */
export class DatabaseStorage implements IStorage {
  constructor() {
    console.log('DatabaseStorage initialized - Consider using repositories directly');
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return await RepositoryFactory.getUserRepository().findById(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return await RepositoryFactory.getUserRepository().findByUsername(username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return await RepositoryFactory.getUserRepository().findByEmail(email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    return await RepositoryFactory.getUserRepository().create(user);
  }
  
  // Design operations
  async getDesign(id: number): Promise<Design | undefined> {
    return await RepositoryFactory.getDesignRepository().findById(id);
  }
  
  async getDesignsByUser(userId: number): Promise<Design[]> {
    return await RepositoryFactory.getDesignRepository().findByUser(userId);
  }
  
  async createDesign(design: InsertDesign): Promise<Design> {
    return await RepositoryFactory.getDesignRepository().create(design);
  }
  
  async updateDesign(id: number, design: Partial<Design>): Promise<Design | undefined> {
    return await RepositoryFactory.getDesignRepository().update(id, design);
  }
  
  async deleteDesign(id: number): Promise<boolean> {
    return await RepositoryFactory.getDesignRepository().delete(id);
  }
  
  // Inventory operations
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return await RepositoryFactory.getInventoryRepository().findById(id);
  }
  
  async getAllInventory(): Promise<Inventory[]> {
    return await RepositoryFactory.getInventoryRepository().findAll();
  }
  
  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return await RepositoryFactory.getInventoryRepository().findByColor(color);
  }
  
  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    return await RepositoryFactory.getInventoryRepository().create(item);
  }
  
  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    return await RepositoryFactory.getInventoryRepository().update(id, item);
  }
  
  // Accessory operations
  async getAccessory(id: number): Promise<Accessory | undefined> {
    return await RepositoryFactory.getAccessoryRepository().findById(id);
  }
  
  async getAllAccessories(): Promise<Accessory[]> {
    return await RepositoryFactory.getAccessoryRepository().findAll();
  }
  
  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    return await RepositoryFactory.getAccessoryRepository().create(accessory);
  }
  
  async updateAccessory(id: number, accessory: Partial<Accessory>): Promise<Accessory | undefined> {
    return await RepositoryFactory.getAccessoryRepository().update(id, accessory);
  }
  
  // Production operations
  async getProduction(id: number): Promise<Production | undefined> {
    return await RepositoryFactory.getProductionRepository().findById(id);
  }
  
  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return await RepositoryFactory.getProductionRepository().findByDesign(designId);
  }
  
  async createProduction(production: InsertProduction): Promise<Production> {
    return await RepositoryFactory.getProductionRepository().create(production);
  }
  
  async updateProduction(id: number, production: Partial<Production>): Promise<Production | undefined> {
    return await RepositoryFactory.getProductionRepository().update(id, production);
  }
  
  // Design accessories operations
  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    await RepositoryFactory.getDesignRepository().addAccessory(designId, accessoryId, quantity);
  }
  
  async getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    return await RepositoryFactory.getDesignRepository().getAccessories(designId);
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return await RepositoryFactory.getOrderRepository().findById(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await RepositoryFactory.getOrderRepository().findByUser(userId);
  }
  
  async getOrdersByDesign(designId: number): Promise<Order[]> {
    return await RepositoryFactory.getOrderRepository().findByDesign(designId);
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    return await RepositoryFactory.getOrderRepository().create(order);
  }
  
  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
    return await RepositoryFactory.getOrderRepository().update(id, order);
  }
  
  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await RepositoryFactory.getOrderRepository().getOrderItems(orderId);
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    return await RepositoryFactory.getOrderRepository().addOrderItem(orderItem);
  }
}

// Create a singleton instance for backward compatibility
export const storage = new DatabaseStorage();