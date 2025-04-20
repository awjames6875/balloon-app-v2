import { eq as equals } from 'drizzle-orm';
import { Order, OrderItem, InsertOrder, InsertOrderItem, orders, orderItems } from '@shared/schema';
import { db } from '../db';
import { BaseRepository } from './base.repository';

/**
 * Order-specific repository interface
 */
export interface IOrderRepository extends BaseRepository<Order, InsertOrder> {
  /**
   * Find all orders placed by a user
   * @param userId The user's id
   * @returns Array of orders placed by the user
   */
  findByUser(userId: number): Promise<Order[]>;
  
  /**
   * Find all orders for a specific design
   * @param designId The design id
   * @returns Array of orders for the design
   */
  findByDesign(designId: number): Promise<Order[]>;
  
  /**
   * Get all items in an order
   * @param orderId The order id
   * @returns Array of order items
   */
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  /**
   * Add an item to an order
   * @param orderItem The order item to add
   * @returns The created order item
   */
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

/**
 * Order repository implementation using database storage
 */
export class OrderRepository implements IOrderRepository {
  async findById(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(equals(orders.id, id)).limit(1);
    return result[0];
  }

  async findByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(equals(orders.userId, userId));
  }

  async findByDesign(designId: number): Promise<Order[]> {
    // Find orders that contain items with the given designId
    const items = await db.select()
      .from(orderItems)
      .where(equals(orderItems.designId, designId));
    
    if (items.length === 0) {
      return [];
    }
    
    // Get unique order IDs
    const orderIds = [...new Set(items.map(item => item.orderId))];
    
    // Fetch orders with those IDs
    return await db.select()
      .from(orders)
      .where(
        // Using an SQL "in" clause
        orders.id.in(orderIds)
      );
  }

  async create(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async update(id: number, orderData: Partial<Order>): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set(orderData)
      .where(equals(orders.id, id))
      .returning();
    
    return result[0];
  }

  async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(orders)
      .where(equals(orders.id, id))
      .returning({ id: orders.id });
    
    return result.length > 0;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(equals(orderItems.orderId, orderId));
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    
    return result[0];
  }
}