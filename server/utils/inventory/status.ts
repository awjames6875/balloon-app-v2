/**
 * Inventory Status Utility Module
 * 
 * Provides functions for calculating inventory status and thresholds.
 */

import { type Inventory } from '../../../shared/schema';

/**
 * Calculate inventory status based on quantity and threshold
 * @param quantity Current inventory quantity
 * @param threshold Threshold for low inventory warning
 * @returns Inventory status as a string
 */
export function calculateInventoryStatus(quantity: number, threshold: number): 'low' | 'ok' | 'critical' {
  if (quantity <= 0) {
    return 'critical';
  }
  
  if (quantity <= threshold) {
    return 'low';
  }
  
  return 'ok';
}

/**
 * Calculate inventory status for a list of items
 * @param items Array of inventory items
 * @returns Object with counts for each status
 */
export function calculateInventoryStatusCounts(items: Inventory[]): { ok: number; low: number; critical: number } {
  const result = { ok: 0, low: 0, critical: 0 };
  
  for (const item of items) {
    const status = calculateInventoryStatus(item.quantity, item.threshold);
    result[status]++;
  }
  
  return result;
}

/**
 * Get suggested threshold based on item usage history
 * This is a placeholder implementation - in a real system this would analyze usage patterns
 * @param item Inventory item
 * @returns Suggested threshold value
 */
export function getSuggestedThreshold(item: Inventory): number {
  // Simple algorithm: suggest 20% of max typical usage
  // In a real implementation, this would analyze actual usage patterns
  const defaultThreshold = 20;
  
  // For now, return a reasonable default or keep existing threshold
  return item.threshold || defaultThreshold;
}

/**
 * Get items that need to be restocked
 * @param items Array of inventory items
 * @returns Array of items that are below threshold
 */
export function getItemsToRestock(items: Inventory[]): Inventory[] {
  return items.filter(item => {
    const status = calculateInventoryStatus(item.quantity, item.threshold);
    return status === 'low' || status === 'critical';
  });
}