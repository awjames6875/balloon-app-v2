import { Accessory, InsertAccessory, accessories, designAccessories } from "@shared/schema";
import { db } from "../../db";
import { eq, and } from "drizzle-orm";

export class AccessoryDatabaseStorage {
  async getAccessory(id: number): Promise<Accessory | undefined> {
    const result = await db.select().from(accessories).where(eq(accessories.id, id));
    return result[0];
  }
  
  async getAllAccessories(): Promise<Accessory[]> {
    return await db.select().from(accessories);
  }
  
  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const result = await db.insert(accessories).values(accessory).returning();
    return result[0];
  }
  
  async updateAccessory(id: number, accessory: Partial<Accessory>): Promise<Accessory | undefined> {
    const result = await db.update(accessories)
      .set(accessory)
      .where(eq(accessories.id, id))
      .returning();
    
    return result[0];
  }
  
  async addAccessoryToDesign(designId: number, accessoryId: number, quantity: number): Promise<void> {
    // Check if there's already an entry for this design-accessory pair
    const existing = await db.select()
      .from(designAccessories)
      .where(
        and(
          eq(designAccessories.designId, designId),
          eq(designAccessories.accessoryId, accessoryId)
        )
      );
    
    if (existing.length > 0) {
      // Update existing quantity
      await db.update(designAccessories)
        .set({ quantity: existing[0].quantity + quantity })
        .where(
          and(
            eq(designAccessories.designId, designId),
            eq(designAccessories.accessoryId, accessoryId)
          )
        );
    } else {
      // Create new entry
      await db.insert(designAccessories).values({
        designId,
        accessoryId,
        quantity
      });
    }
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