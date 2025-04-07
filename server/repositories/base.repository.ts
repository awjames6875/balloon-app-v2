/**
 * Base repository interface
 * All entity-specific repositories should implement this interface
 */
export interface BaseRepository<T, InsertT> {
  /**
   * Find an entity by ID
   * @param id The entity ID
   * @returns The entity or undefined if not found
   */
  findById(id: number): Promise<T | undefined>;
  
  /**
   * Create a new entity
   * @param data The entity data to create
   * @returns The created entity
   */
  create(data: InsertT): Promise<T>;
  
  /**
   * Update an existing entity
   * @param id The entity ID
   * @param data The data to update
   * @returns The updated entity or undefined if not found
   */
  update(id: number, data: Partial<T>): Promise<T | undefined>;
  
  /**
   * Delete an entity
   * @param id The entity ID
   * @returns True if entity was deleted, false otherwise
   */
  delete(id: number): Promise<boolean>;
}