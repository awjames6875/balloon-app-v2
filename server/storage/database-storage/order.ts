import { Order, InsertOrder, OrderItem, InsertOrderItem, orders, orderItems } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export class OrderDatabaseStorage {
  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }
  
  async getOrdersByDesign(designId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.designId, designId));
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }
  
  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set(order)
      .where(eq(orders.id, id))
      .returning();
    
    return result[0];
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }
}