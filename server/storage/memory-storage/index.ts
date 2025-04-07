import { IStorage } from "../interfaces";
import { UserMemoryStorage } from "./user";
import { DesignMemoryStorage } from "./design";
import { InventoryMemoryStorage } from "./inventory";
import { AccessoryMemoryStorage } from "./accessory";
import { ProductionMemoryStorage } from "./production";
import { OrderMemoryStorage } from "./order";

export class MemStorage implements IStorage {
  private userStorage: UserMemoryStorage;
  private designStorage: DesignMemoryStorage;
  private inventoryStorage: InventoryMemoryStorage;
  private accessoryStorage: AccessoryMemoryStorage;
  private productionStorage: ProductionMemoryStorage;
  private orderStorage: OrderMemoryStorage;
  
  constructor() {
    this.userStorage = new UserMemoryStorage();
    this.designStorage = new DesignMemoryStorage();
    this.inventoryStorage = new InventoryMemoryStorage();
    this.accessoryStorage = new AccessoryMemoryStorage();
    this.productionStorage = new ProductionMemoryStorage();
    this.orderStorage = new OrderMemoryStorage();
  }
  
  // User operations
  async getUser(id: number) {
    return this.userStorage.getUser(id);
  }
  
  async getUserByUsername(username: string) {
    return this.userStorage.getUserByUsername(username);
  }
  
  async getUserByEmail(email: string) {
    return this.userStorage.getUserByEmail(email);
  }
  
  async createUser(user) {
    return this.userStorage.createUser(user);
  }
  
  // Design operations
  async getDesign(id: number) {
    return this.designStorage.getDesign(id);
  }
  
  async getDesignsByUser(userId: number) {
    return this.designStorage.getDesignsByUser(userId);
  }
  
  async createDesign(design) {
    return this.designStorage.createDesign(design);
  }
  
  async updateDesign(id: number, design) {
    return this.designStorage.updateDesign(id, design);
  }
  
  async deleteDesign(id: number) {
    return this.designStorage.deleteDesign(id);
  }
  
  // Inventory operations
  async getInventoryItem(id: number) {
    return this.inventoryStorage.getInventoryItem(id);
  }
  
  async getAllInventory() {
    return this.inventoryStorage.getAllInventory();
  }
  
  async getInventoryByColor(color: string) {
    return this.inventoryStorage.getInventoryByColor(color);
  }
  
  async createInventoryItem(item) {
    return this.inventoryStorage.createInventoryItem(item);
  }
  
  async updateInventoryItem(id: number, item) {
    return this.inventoryStorage.updateInventoryItem(id, item);
  }
  
  // Accessory operations
  async getAccessory(id: number) {
    return this.accessoryStorage.getAccessory(id);
  }
  
  async getAllAccessories() {
    return this.accessoryStorage.getAllAccessories();
  }
  
  async createAccessory(accessory) {
    return this.accessoryStorage.createAccessory(accessory);
  }
  
  async updateAccessory(id: number, accessory) {
    return this.accessoryStorage.updateAccessory(id, accessory);
  }
  
  // Design accessories operations
  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number) {
    return this.accessoryStorage.addAccessoryToDesign(designId, accessoryId, quantity);
  }
  
  async getDesignAccessories(designId: number) {
    return this.accessoryStorage.getDesignAccessories(designId);
  }
  
  // Production operations
  async getProduction(id: number) {
    return this.productionStorage.getProduction(id);
  }
  
  async getProductionsByDesign(designId: number) {
    return this.productionStorage.getProductionsByDesign(designId);
  }
  
  async createProduction(production) {
    return this.productionStorage.createProduction(production);
  }
  
  async updateProduction(id: number, production) {
    return this.productionStorage.updateProduction(id, production);
  }
  
  // Order operations
  async getOrder(id: number) {
    return this.orderStorage.getOrder(id);
  }
  
  async getOrdersByUser(userId: number) {
    return this.orderStorage.getOrdersByUser(userId);
  }
  
  async getOrdersByDesign(designId: number) {
    return this.orderStorage.getOrdersByDesign(designId);
  }
  
  async createOrder(order) {
    return this.orderStorage.createOrder(order);
  }
  
  async updateOrder(id: number, order) {
    return this.orderStorage.updateOrder(id, order);
  }
  
  // Order items operations
  async getOrderItems(orderId: number) {
    return this.orderStorage.getOrderItems(orderId);
  }
  
  async addOrderItem(orderItem) {
    return this.orderStorage.addOrderItem(orderItem);
  }
}