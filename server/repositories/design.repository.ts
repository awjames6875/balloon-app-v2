import { Design, InsertDesign, designs, designAccessories, accessories, Accessory } from '@shared/schema';
import { BaseRepository } from './base.repository';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';

/**
 * Design-specific repository interface
 */
export interface IDesignRepository extends BaseRepository<Design, InsertDesign> {
  /**
   * Find all designs created by a user
   * @param userId The user's id
   * @returns Array of designs belonging to the user
   */
  findByUser(userId: number): Promise<Design[]>;
  
  /**
   * Add an accessory to a design with a specified quantity
   * @param designId The design id
   * @param accessoryId The accessory id
   * @param quantity The quantity to add
   */
  addAccessory(designId: number, accessoryId: number, quantity: number): Promise<void>;
  
  /**
   * Get all accessories associated with a design
   * @param designId The design id
   * @returns Array of accessories with their quantities
   */
  getAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]>;
}

/**
 * Design repository implementation using database storage
 */
export class DesignRepository implements IDesignRepository {
  async findById(id: number): Promise<Design | undefined> {
    const result = await db.select().from(designs).where(eq(designs.id, id)).limit(1);
    return result[0];
  }

  async findByUser(userId: number): Promise<Design[]> {
    return await db.select().from(designs).where(eq(designs.userId, userId));
  }
  
  async create(design: InsertDesign): Promise<Design> {
    const result = await db.insert(designs).values(design).returning();
    return result[0];
  }
  
  async update(id: number, designData: Partial<Design>): Promise<Design | undefined> {
    const result = await db.update(designs)
      .set(designData)
      .where(eq(designs.id, id))
      .returning();
    return result[0];
  }
  
  async delete(id: number): Promise<boolean> {
    // First delete any associated accessories
    await db.delete(designAccessories).where(eq(designAccessories.designId, id));
    
    // Then delete the design itself
    const result = await db.delete(designs).where(eq(designs.id, id)).returning();
    return result.length > 0;
  }
  
  async addAccessory(designId: number, accessoryId: number, quantity: number): Promise<void> {
    // Check if the association already exists
    const existing = await db.select()
      .from(designAccessories)
      .where(
        and(
          eq(designAccessories.designId, designId),
          eq(designAccessories.accessoryId, accessoryId)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing quantity
      await db.update(designAccessories)
        .set({ quantity })
        .where(
          and(
            eq(designAccessories.designId, designId),
            eq(designAccessories.accessoryId, accessoryId)
          )
        );
    } else {
      // Create new association
      await db.insert(designAccessories).values({
        designId,
        accessoryId,
        quantity
      });
    }
  }
  
  async getAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    const results = await db
      .select({
        accessory: accessories,
        quantity: designAccessories.quantity
      })
      .from(designAccessories)
      .innerJoin(accessories, eq(designAccessories.accessoryId, accessories.id))
      .where(eq(designAccessories.designId, designId));
    
    return results;
  }
}