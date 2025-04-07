import { Production, InsertProduction, production as productionTable } from '@shared/schema';
import { BaseRepository } from './base.repository';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Production-specific repository interface
 */
export interface IProductionRepository extends BaseRepository<Production, InsertProduction> {
  /**
   * Find all production records for a design
   * @param designId The design id
   * @returns Array of production records for the design
   */
  findByDesign(designId: number): Promise<Production[]>;
}

/**
 * Production repository implementation using database storage
 */
export class ProductionRepository implements IProductionRepository {
  async findById(id: number): Promise<Production | undefined> {
    const result = await db.select().from(productionTable).where(eq(productionTable.id, id)).limit(1);
    return result[0];
  }
  
  async findByDesign(designId: number): Promise<Production[]> {
    return await db.select().from(productionTable).where(eq(productionTable.designId, designId));
  }
  
  async create(production: InsertProduction): Promise<Production> {
    const result = await db.insert(productionTable).values(production).returning();
    return result[0];
  }
  
  async update(id: number, productionData: Partial<Production>): Promise<Production | undefined> {
    const result = await db.update(productionTable)
      .set(productionData)
      .where(eq(productionTable.id, id))
      .returning();
    return result[0];
  }
  
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(productionTable).where(eq(productionTable.id, id)).returning();
    return result.length > 0;
  }
}