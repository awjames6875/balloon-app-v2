/**
 * Utilities Module
 * 
 * This is the main entry point for all utility functions used throughout the application.
 * It re-exports functionality from specialized utility modules.
 */

// Re-export all utilities for easier imports
export * from './file';
export * from './inventory';
export * from './validation';

// For backward compatibility (will be removed after all imports are updated)
export { calculateInventoryStatus } from './inventory';