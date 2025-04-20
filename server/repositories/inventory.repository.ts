import { eq as equals, sql } from 'drizzle-orm';
import { Inventory, InsertInventory, inventory } from '@shared/schema';
import { db } from '../db';
import { BaseRepository } from './base.repository';

/**
 * Inventory-specific repository interface
 */
export interface IInventoryRepository extends BaseRepository<Inventory, InsertInventory> {
  /**
   * Find all inventory items
   * @returns Array of all inventory items
   */
  findAll(): Promise<Inventory[]>;
  
  /**
   * Find inventory items by color
   * @param color The color to search for
   * @returns Array of inventory items with the specified color
   */
  findByColor(color: string): Promise<Inventory[]>;
  
  /**
   * Find inventory items with low stock
   * @param threshold The threshold for low stock (default: 10)
   * @returns Array of inventory items with quantity below the threshold
   */
  findLowStock(threshold?: number): Promise<Inventory[]>;
}

/**
 * Inventory repository implementation using database storage
 */
export class InventoryRepository implements IInventoryRepository {
  async findById(id: number): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(equals(inventory.id, id)).limit(1);
    return result[0];
  }
  
  async findAll(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }
  
  async findByColor(color: string): Promise<Inventory[]> {
    // Use sql`` tagged template to create a raw SQL condition
    return await db.select().from(inventory).where(sql`${inventory.color} = ${color}`);
  }
  
  async findLowStock(threshold: number = 10): Promise<Inventory[]> {
    return await db.select().from(inventory).where(sql`${inventory.quantity} < ${threshold}`);
  }

  async create(item: InsertInventory): Promise<Inventory> {
    const result = await db.insert(inventory).values(item).returning();
    return result[0];
  }

  async update(id: number, itemData: Partial<Inventory>): Promise<Inventory | undefined> {
    const result = await db
      .update(inventory)
      .set(itemData)
      .where(equals(inventory.id, id))
      .returning();
    
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(inventory)
      .where(equals(inventory.id, id))
      .returning({ id: inventory.id });
    
    return result.length > 0;
  }
}