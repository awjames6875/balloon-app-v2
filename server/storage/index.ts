/**
 * Storage Module
 * 
 * This is the main entry point for data storage operations.
 * It provides access to storage implementations and factories.
 */

import { MemStorage } from './memory-storage';
import { DatabaseStorage } from './database-storage';
import { IStorage } from './interfaces';

/**
 * Storage factory that provides access to the appropriate storage implementation
 */
export class StorageFactory {
  private static instance: IStorage;
  
  /**
   * Get the configured storage implementation
   * @returns Storage implementation (database or memory based on environment)
   */
  static getStorage(): IStorage {
    if (!this.instance) {
      // In production or with DATABASE_URL, use database storage
      // Otherwise, fall back to memory storage
      if (process.env.DATABASE_URL) {
        console.log('DatabaseStorage initialized - Consider using repositories directly');
        this.instance = new DatabaseStorage();
      } else {
        console.log('MemStorage initialized - For development use only');
        this.instance = new MemStorage();
      }
    }
    
    return this.instance;
  }
  
  /**
   * Reset the storage instance (useful for testing)
   */
  static resetStorage(): void {
    this.instance = undefined;
  }
}

// Export storage interface and implementations
export { IStorage } from './interfaces';
export { MemStorage } from './memory-storage';
export { DatabaseStorage } from './database-storage';

// For backward compatibility, export a default storage instance
export const storage = StorageFactory.getStorage();