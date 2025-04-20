import { eq as equals, sql } from 'drizzle-orm';
import { Production, InsertProduction, production } from '@shared/schema';
import { db } from '../db';
import { BaseRepository } from './base.repository';

/**
 * Production-specific repository interface
 */
export interface IProductionRepository extends BaseRepository<Production, InsertProduction> {
  /**
   * Find all productions for a specific design
   * @param designId The design id
   * @returns Array of productions for the design
   */
  findByDesign(designId: number): Promise<Production[]>;
  
  /**
   * Find productions by status
   * @param status The production status
   * @returns Array of productions with the specified status
   */
  findByStatus(status: string): Promise<Production[]>;
  
  /**
   * Find productions scheduled for a specific date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns Array of productions scheduled within the date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Production[]>;
}

/**
 * Production repository implementation using database storage
 */
export class ProductionRepository implements IProductionRepository {
  async findById(id: number): Promise<Production | undefined> {
    const result = await db.select().from(production).where(equals(production.id, id)).limit(1);
    return result[0];
  }

  async findByDesign(designId: number): Promise<Production[]> {
    return await db.select().from(production).where(equals(production.designId, designId));
  }

  async findByStatus(status: string): Promise<Production[]> {
    return await db.select().from(production).where(equals(production.status, status));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Production[]> {
    return await db
      .select()
      .from(production)
      .where(
        sql`${production.startDate} >= ${startDate.toISOString()} AND ${production.startDate} <= ${endDate.toISOString()}`
      );
  }

  async create(productionData: InsertProduction): Promise<Production> {
    const result = await db.insert(production).values(productionData).returning();
    return result[0];
  }

  async update(id: number, productionData: Partial<Production>): Promise<Production | undefined> {
    const result = await db
      .update(production)
      .set(productionData)
      .where(equals(production.id, id))
      .returning();
    
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(production)
      .where(equals(production.id, id))
      .returning({ id: production.id });
    
    return result.length > 0;
  }
}