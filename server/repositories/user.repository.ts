import { User, InsertUser, users } from '@shared/schema';
import { BaseRepository } from './base.repository';
import { db } from '../db';
import { eq } from 'drizzle-orm';

/**
 * User-specific repository interface extending the base repository
 */
export interface IUserRepository extends BaseRepository<User, InsertUser> {
  /**
   * Find a user by their username
   * @param username The username to search for
   * @returns The user or undefined if not found
   */
  findByUsername(username: string): Promise<User | undefined>;
  
  /**
   * Find a user by their email
   * @param email The email to search for
   * @returns The user or undefined if not found
   */
  findByEmail(email: string): Promise<User | undefined>;
}

/**
 * User repository implementation using database storage
 */
export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async findByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
  
  async create(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  
  async update(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}