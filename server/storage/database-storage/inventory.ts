import { Inventory, InsertInventory, inventory } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export class InventoryDatabaseStorage {
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(eq(inventory.id, id));
    return result[0];
  }
  
  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }
  
  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.color, color));
  }
  
  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(item).returning();
    return result[0];
  }
  
  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory)
      .set(item)
      .where(eq(inventory.id, id))
      .returning();
    
    return result[0];
  }
}