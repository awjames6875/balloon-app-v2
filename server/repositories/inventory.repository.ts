import { Inventory, InsertInventory, inventory } from '@shared/schema';
import { BaseRepository } from './base.repository';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * Inventory-specific repository interface
 */
export interface IInventoryRepository extends BaseRepository<Inventory, InsertInventory> {
  /**
   * Get all inventory items
   * @returns Array of all inventory items
   */
  findAll(): Promise<Inventory[]>;
  
  /**
   * Find inventory items by color
   * @param color The color to search for
   * @returns Array of inventory items with the specified color
   */
  findByColor(color: string): Promise<Inventory[]>;
}

/**
 * Inventory repository implementation using database storage
 */
export class InventoryRepository implements IInventoryRepository {
  async findById(id: number): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(eq(inventory.id, id)).limit(1);
    return result[0];
  }
  
  async findAll(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }
  
  async findByColor(color: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.color, color));
  }
  
  async create(item: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(item).returning();
    return result[0];
  }
  
  async update(id: number, itemData: Partial<Inventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory)
      .set(itemData)
      .where(eq(inventory.id, id))
      .returning();
    return result[0];
  }
  
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(inventory).where(eq(inventory.id, id)).returning();
    return result.length > 0;
  }
}