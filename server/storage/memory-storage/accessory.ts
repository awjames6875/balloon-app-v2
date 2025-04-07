import { Accessory, InsertAccessory } from "@shared/schema";

export class AccessoryMemoryStorage {
  private accessories: Map<number, Accessory>;
  private accessoryIdCounter: number;
  private designAccessories: Map<number, { accessoryId: number; quantity: number }[]>;
  
  constructor() {
    this.accessories = new Map<number, Accessory>();
    this.accessoryIdCounter = 1;
    this.designAccessories = new Map<number, { accessoryId: number; quantity: number }[]>();
    this.initDefaultAccessories();
  }
  
  private initDefaultAccessories() {
    const defaultAccessories = [
      { name: 'Balloon Pump', description: 'Manual balloon pump', price: 15.99 },
      { name: 'Electric Balloon Inflator', description: 'Electric balloon pump', price: 29.99 },
      { name: 'Balloon Arch Kit', description: 'Complete balloon arch kit', price: 39.99 },
      { name: 'Balloon Weights', description: 'Pack of 10 balloon weights', price: 9.99 },
      { name: 'Curling Ribbon', description: 'Balloon curling ribbon set', price: 5.99 }
    ];
    
    defaultAccessories.forEach(accessory => {
      this.createAccessory(accessory);
    });
  }
  
  async getAccessory(id: number): Promise<Accessory | undefined> {
    return this.accessories.get(id);
  }
  
  async getAllAccessories(): Promise<Accessory[]> {
    return Array.from(this.accessories.values());
  }
  
  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const newAccessory: Accessory = {
      id: this.accessoryIdCounter++,
      createdAt: new Date(),
      ...accessory
    };
    
    this.accessories.set(newAccessory.id, newAccessory);
    return newAccessory;
  }
  
  async updateAccessory(id: number, accessory: Partial<Accessory>): Promise<Accessory | undefined> {
    const existingAccessory = this.accessories.get(id);
    
    if (!existingAccessory) {
      return undefined;
    }
    
    const updatedAccessory = {
      ...existingAccessory,
      ...accessory
    };
    
    this.accessories.set(id, updatedAccessory);
    return updatedAccessory;
  }
  
  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    const designAccessoryList = this.designAccessories.get(designId) || [];
    
    // Check if the accessory is already in the design
    const existingIndex = designAccessoryList.findIndex(item => item.accessoryId === accessoryId);
    
    if (existingIndex >= 0) {
      // Update existing quantity
      designAccessoryList[existingIndex].quantity += quantity;
    } else {
      // Add new accessory
      designAccessoryList.push({
        accessoryId,
        quantity
      });
    }
    
    this.designAccessories.set(designId, designAccessoryList);
  }
  
  async getDesignAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    const designAccessoryList = this.designAccessories.get(designId) || [];
    const result: { accessory: Accessory; quantity: number }[] = [];
    
    for (const item of designAccessoryList) {
      const accessory = await this.getAccessory(item.accessoryId);
      
      if (accessory) {
        result.push({
          accessory,
          quantity: item.quantity
        });
      }
    }
    
    return result;
  }
}