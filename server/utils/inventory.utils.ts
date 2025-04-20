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