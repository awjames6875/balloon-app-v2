import { eq as equals, sql } from 'drizzle-orm';
import { Design, InsertDesign, Accessory, designs, designAccessories, accessories } from '@shared/schema';
import { db } from '../db';
import { BaseRepository } from './base.repository';

/**
 * Design-specific repository interface
 */
export interface IDesignRepository extends BaseRepository<Design, InsertDesign> {
  /**
   * Find all designs created by a user
   * @param userId The user's id
   * @returns Array of designs created by the user
   */
  findByUser(userId: number): Promise<Design[]>;
  
  /**
   * Add an accessory to a design
   * @param designId The design's id
   * @param accessoryId The accessory's id
   * @param quantity The quantity of the accessory
   */
  addAccessory(designId: number, accessoryId: number, quantity: number): Promise<void>;
  
  /**
   * Get all accessories used in a design
   * @param designId The design's id
   * @returns Array of accessories with quantities
   */
  getAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]>;
}

/**
 * Design repository implementation using database storage
 */
export class DesignRepository implements IDesignRepository {
  async findById(id: number): Promise<Design | undefined> {
    const result = await db.select().from(designs).where(equals(designs.id, id)).limit(1);
    return result[0];
  }

  async findByUser(userId: number): Promise<Design[]> {
    return await db.select().from(designs).where(equals(designs.userId, userId));
  }

  async create(design: InsertDesign): Promise<Design> {
    try {
      // Use a slightly different approach to avoid type issues
      const result = await db.insert(designs).values({
        userId: design.userId,
        clientName: design.clientName,
        eventDate: design.eventDate,
        dimensions: design.dimensions,
        notes: design.notes,
        imageUrl: design.imageUrl,
        backgroundUrl: design.backgroundUrl,
        elements: design.elements,
        colorAnalysis: design.colorAnalysis,
        materialRequirements: design.materialRequirements,
        totalBalloons: design.totalBalloons,
        estimatedClusters: design.estimatedClusters,
        productionTime: design.productionTime
      } as any).returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating design:', error);
      throw error;
    }
  }

  async update(id: number, designData: Partial<Design>): Promise<Design | undefined> {
    const result = await db
      .update(designs)
      .set(designData)
      .where(equals(designs.id, id))
      .returning();
    
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    // First, delete associated design accessories
    await db
      .delete(designAccessories)
      .where(equals(designAccessories.designId, id));
      
    // Then delete the design
    const result = await db
      .delete(designs)
      .where(equals(designs.id, id))
      .returning({ id: designs.id });
    
    return result.length > 0;
  }

  async addAccessory(designId: number, accessoryId: number, quantity: number): Promise<void> {
    // Check if the design-accessory pair already exists
    const existingRecord = await db
      .select()
      .from(designAccessories)
      .where(
        sql`${designAccessories.designId} = ${designId} AND ${designAccessories.accessoryId} = ${accessoryId}`
      )
      .limit(1);
    
    if (existingRecord.length > 0) {
      // Update the quantity
      await db
        .update(designAccessories)
        .set({ quantity })
        .where(
          sql`${designAccessories.designId} = ${designId} AND ${designAccessories.accessoryId} = ${accessoryId}`
        );
    } else {
      // Create a new record
      await db
        .insert(designAccessories)
        .values({
          designId,
          accessoryId,
          quantity
        });
    }
  }

  async getAccessories(designId: number): Promise<{ accessory: Accessory; quantity: number }[]> {
    const result = await db
      .select({
        accessory: accessories,
        quantity: designAccessories.quantity
      })
      .from(designAccessories)
      .innerJoin(accessories, equals(designAccessories.accessoryId, accessories.id))
      .where(equals(designAccessories.designId, designId));
    
    return result;
  }
}