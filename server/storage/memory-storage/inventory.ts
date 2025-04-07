import { Inventory, InsertInventory } from "@shared/schema";

export class InventoryMemoryStorage {
  private inventory: Map<number, Inventory>;
  private inventoryIdCounter: number;
  
  constructor() {
    this.inventory = new Map<number, Inventory>();
    this.inventoryIdCounter = 1;
    this.initDefaultInventory();
  }
  
  private initDefaultInventory() {
    const defaultColors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black'];
    const sizes = ['11inch', '16inch'];
    
    defaultColors.forEach(color => {
      sizes.forEach(size => {
        const initialQuantity = Math.floor(Math.random() * 100) + 50; // 50-150 balloons
        this.createInventoryItem({
          color,
          size,
          quantity: initialQuantity,
          status: initialQuantity > 30 ? 'in_stock' : (initialQuantity > 10 ? 'low_stock' : 'out_of_stock')
        });
      });
    });
  }
  
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }
  
  async getAllInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }
  
  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      item => item.color === color
    );
  }
  
  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const newItem: Inventory = {
      id: this.inventoryIdCounter++,
      createdAt: new Date(),
      ...item
    };
    
    this.inventory.set(newItem.id, newItem);
    return newItem;
  }
  
  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    const existingItem = this.inventory.get(id);
    
    if (!existingItem) {
      return undefined;
    }
    
    // Update item and recalculate status if quantity was changed
    const updatedItem = {
      ...existingItem,
      ...item
    };
    
    // Update status if quantity was changed
    if (item.quantity !== undefined) {
      updatedItem.status = item.quantity > 30 ? 'in_stock' : (item.quantity > 10 ? 'low_stock' : 'out_of_stock');
    }
    
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }
}