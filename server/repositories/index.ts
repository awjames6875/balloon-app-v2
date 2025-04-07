// Repository interfaces
import { IUserRepository } from './user.repository';
import { IDesignRepository } from './design.repository';
import { IInventoryRepository } from './inventory.repository';
import { IAccessoryRepository } from './accessory.repository';
import { IProductionRepository } from './production.repository';
import { IOrderRepository } from './order.repository';

/**
 * Factory for creating repository instances
 */
export class RepositoryFactory {
  private static userRepository: IUserRepository;
  private static designRepository: IDesignRepository;
  private static inventoryRepository: IInventoryRepository;
  private static accessoryRepository: IAccessoryRepository;
  private static productionRepository: IProductionRepository;
  private static orderRepository: IOrderRepository;
  
  /**
   * Get the user repository instance
   * @returns User repository instance
   */
  static getUserRepository(): IUserRepository {
    // Implement when UserRepository is available
    // if (!this.userRepository) {
    //   this.userRepository = new UserRepository();
    // }
    return this.userRepository;
  }
  
  /**
   * Get the design repository instance
   * @returns Design repository instance
   */
  static getDesignRepository(): IDesignRepository {
    // Implement when DesignRepository is available
    // if (!this.designRepository) {
    //   this.designRepository = new DesignRepository();
    // }
    return this.designRepository;
  }
  
  /**
   * Get the inventory repository instance
   * @returns Inventory repository instance
   */
  static getInventoryRepository(): IInventoryRepository {
    // Implement when InventoryRepository is available
    // if (!this.inventoryRepository) {
    //   this.inventoryRepository = new InventoryRepository();
    // }
    return this.inventoryRepository;
  }
  
  /**
   * Get the accessory repository instance
   * @returns Accessory repository instance
   */
  static getAccessoryRepository(): IAccessoryRepository {
    // Implement when AccessoryRepository is available
    // if (!this.accessoryRepository) {
    //   this.accessoryRepository = new AccessoryRepository();
    // }
    return this.accessoryRepository;
  }
  
  /**
   * Get the production repository instance
   * @returns Production repository instance
   */
  static getProductionRepository(): IProductionRepository {
    // Implement when ProductionRepository is available
    // if (!this.productionRepository) {
    //   this.productionRepository = new ProductionRepository();
    // }
    return this.productionRepository;
  }
  
  /**
   * Get the order repository instance
   * @returns Order repository instance
   */
  static getOrderRepository(): IOrderRepository {
    // Implement when OrderRepository is available
    // if (!this.orderRepository) {
    //   this.orderRepository = new OrderRepository();
    // }
    return this.orderRepository;
  }
}