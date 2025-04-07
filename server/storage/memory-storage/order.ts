import { Order, InsertOrder, OrderItem, InsertOrderItem } from "@shared/schema";

export class OrderMemoryStorage {
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private orderIdCounter: number;
  private orderItemIdCounter: number;
  
  constructor() {
    this.orders = new Map<number, Order>();
    this.orderItems = new Map<number, OrderItem[]>();
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.userId === userId
    );
  }
  
  async getOrdersByDesign(designId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.designId === designId
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const newOrder: Order = {
      id: this.orderIdCounter++,
      createdAt: new Date(),
      status: order.status || 'pending',
      ...order
    };
    
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }
  
  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    
    if (!existingOrder) {
      return undefined;
    }
    
    const updatedOrder = {
      ...existingOrder,
      ...order
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.get(orderId) || [];
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newOrderItem: OrderItem = {
      id: this.orderItemIdCounter++,
      createdAt: new Date(),
      ...orderItem
    };
    
    const orderItems = this.orderItems.get(orderItem.orderId) || [];
    orderItems.push(newOrderItem);
    this.orderItems.set(orderItem.orderId, orderItems);
    
    return newOrderItem;
  }
}