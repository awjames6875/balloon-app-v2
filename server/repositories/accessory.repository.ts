import { eq, sql } from 'drizzle-orm';
import { Accessory, InsertAccessory } from '@shared/schema';
import { db } from '../db';
import { accessories } from '@shared/schema';
import { BaseRepository } from './base.repository';

/**
 * Accessory-specific repository interface
 */
export interface IAccessoryRepository extends BaseRepository<Accessory, InsertAccessory> {
  /**
   * Find all accessories
   * @returns Array of all accessories
   */
  findAll(): Promise<Accessory[]>;
  
  /**
   * Find accessories by type
   * @param type The type to search for
   * @returns Array of accessories with the specified type
   */
  findByType(type: string): Promise<Accessory[]>;
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
  
  async findByType(type: string): Promise<Accessory[]> {
    // Using sql`` tagged template to create a raw SQL condition
    return await db.select().from(accessories).where(sql`${accessories.name} LIKE ${`%${type}%`}`);
  }

  async create(accessory: InsertAccessory): Promise<Accessory> {
    const result = await db.insert(accessories).values(accessory).returning();
    return result[0];
  }

  async update(id: number, accessoryData: Partial<Accessory>): Promise<Accessory | undefined> {
    const result = await db
      .update(accessories)
      .set(accessoryData)
      .where(eq(accessories.id, id))
      .returning();
    
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(accessories)
      .where(eq(accessories.id, id))
      .returning({ id: accessories.id });
    
    return result.length > 0;
  }
}