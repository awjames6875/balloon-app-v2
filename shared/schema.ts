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

// Measurement line schema definition
export const measurementLineSchema = z.object({
  id: z.string(),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  realWorldLength: z.number(), // Real-world measurement in feet or meters
  unit: z.enum(['feet', 'meters', 'inches']),
  label: z.string(),
  color: z.string().default('#ff0000'),
});

export type MeasurementLine = z.infer<typeof measurementLineSchema>;

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
  clientId: integer("client_id").references(() => clients.id),
  clientName: text("client_name").notNull(),
  projectName: text("project_name").notNull().default("Untitled Project"),
  eventType: text("event_type").notNull().default("Birthday"),
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
  measurements: json("measurements").$type<MeasurementLine[]>().default([]),
  scale: decimal("scale").default("1"), // Pixels per unit (e.g., pixels per foot)
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
  clientId: true,
  clientName: true,
  projectName: true,
  eventType: true,
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

export const insertProductionSchema = createInsertSchema(production)
  .pick({
    designId: true,
    status: true,
    startDate: true,
    notes: true,
  })
  .transform((data) => {
    // Convert string date to Date object if needed
    return {
      ...data,
      startDate: data.startDate && typeof data.startDate === 'string' 
        ? new Date(data.startDate) 
        : data.startDate,
    };
  });

export const insertOrderSchema = createInsertSchema(orders)
  .pick({
    userId: true,
    designId: true,
    supplierName: true,
    expectedDeliveryDate: true,
    priority: true,
    notes: true,
    totalQuantity: true,
    totalCost: true,
  })
  .transform((data) => {
    // Convert string date to Date object if needed
    return {
      ...data,
      expectedDeliveryDate: data.expectedDeliveryDate && typeof data.expectedDeliveryDate === 'string' 
        ? new Date(data.expectedDeliveryDate) 
        : data.expectedDeliveryDate,
    };
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

// Clients table for intake form
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  eventType: text("event_type"),
  budget: text("budget"),
  theme: text("theme"),
  colors: text("colors"),
  inspiration: text("inspiration"),
  birthdate: text("birthdate"),
  canText: boolean("can_text").default(false),
  crmSynced: boolean("crm_synced").default(false),
  crmId: text("crm_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  eventType: true,
  budget: true,
  theme: true,
  colors: true,
  inspiration: true,
  birthdate: true,
  canText: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

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

// Interface definitions for design-related types
export type ColorAnalysis = {
  colors: Array<{
    name: string;
    percentage: number;
  }>;
};

export type MaterialRequirements = {
  [color: string]: {
    total: number;
    small: number;
    large: number;
  };
};

export type DesignAnalysis = {
  colorAnalysis?: ColorAnalysis;
  materialRequirements?: MaterialRequirements;
  totalBalloons?: number;
  estimatedClusters?: number;
  productionTime?: string;
};