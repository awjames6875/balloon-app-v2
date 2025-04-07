import { Accessory, InsertAccessory, accessories } from '@shared/schema';
import { BaseRepository } from './base.repository';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Accessory-specific repository interface
 */
export interface IAccessoryRepository extends BaseRepository<Accessory, InsertAccessory> {
  /**
   * Get all accessories
   * @returns Array of all accessories
   */
  findAll(): Promise<Accessory[]>;
}

/**
 * Accessory repository implementation using database storage
 */
export class AccessoryRepository implements IAccessoryRepository {
  async findById(id: number): Promise<Accessory | undefined> {
    const result = await db.select().from(accessories).where(eq(accessories.id, id)).limit(1);
    return result[0];
  }
  
  async findAll(): Promise<Accessory[]> {
    return await db.select().from(accessories);
  }
  
  async create(accessory: InsertAccessory): Promise<Accessory> {
    const result = await db.insert(accessories).values(accessory).returning();
    return result[0];
  }
  
  async update(id: number, accessoryData: Partial<Accessory>): Promise<Accessory | undefined> {
    const result = await db.update(accessories)
      .set(accessoryData)
      .where(eq(accessories.id, id))
      .returning();
    return result[0];
  }
  
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(accessories).where(eq(accessories.id, id)).returning();
    return result.length > 0;
  }
}