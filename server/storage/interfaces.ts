import { User, InsertUser, Design, InsertDesign, Inventory, InsertInventory, 
         Accessory, InsertAccessory, Production, InsertProduction, 
         Order, InsertOrder, OrderItem, InsertOrderItem } from '@shared/schema';

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
  
  // Design accessories operations
  addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void>;
  getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]>;
  
  // Production operations
  getProduction(id: number): Promise<Production | undefined>;
  getProductionsByDesign(designId: number): Promise<Production[]>;
  createProduction(production: InsertProduction): Promise<Production>;
  updateProduction(id: number, production: Partial<Production>): Promise<Production | undefined>;
  
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