/**
 * Inventory Status Utility Module
 * 
 * This module provides functions for managing inventory status calculations.
 */

/**
 * Calculates inventory status based on quantity and threshold
 * Used for both balloons and accessories to determine stock levels
 * 
 * @param quantity Current quantity in stock
 * @param threshold Level at which stock is considered low
 * @returns Status as 'in_stock', 'low_stock', or 'out_of_stock'
 */
export function calculateInventoryStatus(quantity: number, threshold: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity <= 0) {
    return 'out_of_stock';
  } else if (quantity <= threshold) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
}

/**
 * Determines if an item needs reordering based on its quantity and threshold
 * 
 * @param quantity Current quantity in stock
 * @param threshold Level at which stock is considered low
 * @returns True if the item should be reordered
 */
export function shouldReorder(quantity: number, threshold: number): boolean {
  return quantity <= threshold;
}

/**
 * Calculates the recommended order quantity based on current stock and threshold
 * 
 * @param quantity Current quantity in stock
 * @param threshold Level at which stock is considered low
 * @param targetBuffer Desired buffer above threshold (default: 2x threshold)
 * @returns Recommended order quantity
 */
export function calculateReorderQuantity(
  quantity: number, 
  threshold: number,
  targetBuffer: number = threshold * 2
): number {
  if (quantity >= threshold) {
    return 0; // No need to reorder yet
  }
  
  // Calculate how many to order to reach target buffer
  return targetBuffer - quantity;
}