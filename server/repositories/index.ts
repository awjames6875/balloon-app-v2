// Repository interfaces and implementations
import { IUserRepository, UserRepository } from './user.repository';
import { IDesignRepository, DesignRepository } from './design.repository';
import { IInventoryRepository, InventoryRepository } from './inventory.repository';
import { IAccessoryRepository, AccessoryRepository } from './accessory.repository';
import { IProductionRepository, ProductionRepository } from './production.repository';
import { IOrderRepository, OrderRepository } from './order.repository';

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
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }
  
  /**
   * Get the design repository instance
   * @returns Design repository instance
   */
  static getDesignRepository(): IDesignRepository {
    if (!this.designRepository) {
      this.designRepository = new DesignRepository();
    }
    return this.designRepository;
  }
  
  /**
   * Get the inventory repository instance
   * @returns Inventory repository instance
   */
  static getInventoryRepository(): IInventoryRepository {
    if (!this.inventoryRepository) {
      this.inventoryRepository = new InventoryRepository();
    }
    return this.inventoryRepository;
  }
  
  /**
   * Get the accessory repository instance
   * @returns Accessory repository instance
   */
  static getAccessoryRepository(): IAccessoryRepository {
    if (!this.accessoryRepository) {
      this.accessoryRepository = new AccessoryRepository();
    }
    return this.accessoryRepository;
  }
  
  /**
   * Get the production repository instance
   * @returns Production repository instance
   */
  static getProductionRepository(): IProductionRepository {
    if (!this.productionRepository) {
      this.productionRepository = new ProductionRepository();
    }
    return this.productionRepository;
  }
  
  /**
   * Get the order repository instance
   * @returns Order repository instance
   */
  static getOrderRepository(): IOrderRepository {
    if (!this.orderRepository) {
      this.orderRepository = new OrderRepository();
    }
    return this.orderRepository;
  }
}