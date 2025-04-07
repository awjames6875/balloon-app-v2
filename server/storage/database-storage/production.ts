import { Production, InsertProduction, production } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export class ProductionDatabaseStorage {
  async getProduction(id: number): Promise<Production | undefined> {
    const result = await db.select().from(production).where(eq(production.id, id));
    return result[0];
  }
  
  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return await db.select().from(production).where(eq(production.designId, designId));
  }
  
  async createProduction(prod: InsertProduction): Promise<Production> {
    const result = await db.insert(production).values(prod).returning();
    return result[0];
  }
  
  async updateProduction(id: number, prod: Partial<Production>): Promise<Production | undefined> {
    const result = await db.update(production)
      .set(prod)
      .where(eq(production.id, id))
      .returning();
    
    return result[0];
  }
}