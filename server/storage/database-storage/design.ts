import { Design, InsertDesign, designs } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export class DesignDatabaseStorage {
  async getDesign(id: number): Promise<Design | undefined> {
    const result = await db.select().from(designs).where(eq(designs.id, id));
    return result[0];
  }
  
  async getDesignsByUser(userId: number): Promise<Design[]> {
    return await db.select().from(designs).where(eq(designs.userId, userId));
  }
  
  async createDesign(design: InsertDesign): Promise<Design> {
    const result = await db.insert(designs).values(design).returning();
    return result[0];
  }
  
  async updateDesign(id: number, design: Partial<Design>): Promise<Design | undefined> {
    const result = await db.update(designs)
      .set(design)
      .where(eq(designs.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteDesign(id: number): Promise<boolean> {
    const result = await db.delete(designs).where(eq(designs.id, id));
    return result.rowCount > 0;
  }
}