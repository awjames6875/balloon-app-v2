
import { storage } from '../server/storage';

async function updateInventory() {
  // Find the red 16inch balloon inventory item
  const inventory = await storage.getAllInventory();
  const redBalloon = inventory.find(item => 
    item.color === 'red' && item.size === '16inch'
  );

  if (redBalloon) {
    // Update existing inventory
    await storage.updateInventoryItem(redBalloon.id, {
      quantity: 25,
      status: 'in_stock'
    });
    console.log('Updated red 16inch balloon inventory to 25');
  } else {
    // Create new inventory item
    await storage.createInventoryItem({
      color: 'red',
      size: '16inch',
      quantity: 25,
      threshold: 20,
      status: 'in_stock'
    });
    console.log('Created new red 16inch balloon inventory with quantity 25');
  }
}

updateInventory().catch(console.error);
