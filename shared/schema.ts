import { pgTable, text, serial, integer, boolean, json, timestamp, pgEnum, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'designer', 'inventory_manager']);
export const colorEnum = pgEnum('color', ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black', 'silver', 'gold']);
export const balloonSizeEnum = pgEnum('balloon_size', ['11inch', '16inch']);
export const inventoryStatusEnum = pgEnum('inventory_status', ['in_stock', 'low_stock', 'out_of_stock']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'cancelled']);

// Element schema definition for canvas editor
export const designElementSchema = z.object({
  id: z.string(),
  type: z.literal('balloon-cluster'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  svgContent: z.string(),
  colors: z.array(z.string()),
  scale: z.number().optional(),
});

export type DesignElement = z.infer<typeof designElementSchema>;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default('designer'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Designs table
export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientName: text("client_name").notNull(),
  eventDate: text("event_date"),
  dimensions: text("dimensions"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  backgroundUrl: text("background_url"),
  elements: json("elements").$type<DesignElement[]>().default([]),
  colorAnalysis: json("color_analysis").$type<{
    colors: Array<{
      name: string;
      percentage: number;
    }>;
  }>(),
  materialRequirements: json("material_requirements").$type<{
    [color: string]: {
      total: number;
      small: number;
      large: number;
    };
  }>(),
  totalBalloons: integer("total_balloons"),
  estimatedClusters: integer("estimated_clusters"),
  productionTime: text("production_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  color: colorEnum("color").notNull(),
  size: balloonSizeEnum("size").notNull(),
  quantity: integer("quantity").notNull().default(0),
  threshold: integer("threshold").notNull().default(20),
  status: inventoryStatusEnum("status").notNull().default('in_stock'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Accessories table
export const accessories = pgTable("accessories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  threshold: integer("threshold").notNull().default(5),
  status: inventoryStatusEnum("status").notNull().default('in_stock'),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Design accessories junction table
export const designAccessories = pgTable("design_accessories", {
  id: serial("id").primaryKey(),
  designId: integer("design_id").notNull().references(() => designs.id),
  accessoryId: integer("accessory_id").notNull().references(() => accessories.id),
  quantity: integer("quantity").notNull().default(1),
});

// Production table
export const production = pgTable("production", {
  id: serial("id").primaryKey(),
  designId: integer("design_id").notNull().references(() => designs.id),
  status: text("status").notNull().default('pending'),
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  actualTime: text("actual_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  designId: integer("design_id").references(() => designs.id),
  status: orderStatusEnum("status").notNull().default('pending'),
  supplierName: text("supplier_name"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  priority: text("priority").notNull().default('normal'),
  notes: text("notes"),
  totalQuantity: integer("total_quantity").notNull().default(0),
  totalCost: integer("total_cost").notNull().default(0), // Store as integer (cents)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table for detailed items in an order
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  inventoryType: text("inventory_type").notNull().default('balloon'),
  color: colorEnum("color").notNull(),
  size: balloonSizeEnum("size").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // Store as integer (cents)
  subtotal: integer("subtotal").notNull(), // Store as integer (cents)
});

// Create Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertDesignSchema = createInsertSchema(designs).pick({
  userId: true,
  clientName: true,
  eventDate: true,
  dimensions: true,
  notes: true,
  imageUrl: true,
  backgroundUrl: true,
  elements: true,
  colorAnalysis: true,
  materialRequirements: true,
  totalBalloons: true,
  estimatedClusters: true,
  productionTime: true,
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  color: true,
  size: true,
  quantity: true,
  threshold: true,
});

export const insertAccessorySchema = createInsertSchema(accessories).pick({
  name: true,
  quantity: true,
  threshold: true,
});

export const insertProductionSchema = createInsertSchema(production).pick({
  designId: true,
  status: true,
  startDate: true,
  notes: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  designId: true,
  supplierName: true,
  expectedDeliveryDate: true,
  priority: true,
  notes: true,
  totalQuantity: true,
  totalCost: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  inventoryType: true,
  color: true,
  size: true,
  quantity: true,
  unitPrice: true,
  subtotal: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Design = typeof designs.$inferSelect;
export type InsertDesign = z.infer<typeof insertDesignSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Accessory = typeof accessories.$inferSelect;
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;

export type Production = typeof production.$inferSelect;
export type InsertProduction = z.infer<typeof insertProductionSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
