
export async function getInventoryByColorAndSize(color: string, size: string) {
  return await db.query.inventory.findFirst({
    where: (inventory, { and, eq }) => 
      and(eq(inventory.color, color), eq(inventory.size, size))
  });
}

import { Inventory, InsertInventory, inventory } from "@shared/schema";
import { db } from "../../db";
import { eq as equals } from "drizzle-orm";

export class InventoryDatabaseStorage {
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(equals(inventory.id, id));
    return result[0];
  }
  
  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }
  
  async getInventoryByColor(color: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(equals(inventory.color, color));
  }
  
  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(item).returning();
    return result[0];
  }
  
  async updateInventoryItem(id: number, item: Partial<Inventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory)
      .set(item)
      .where(equals(inventory.id, id))
      .returning();
    
    return result[0];
  }
}