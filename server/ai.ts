import fs from 'fs';
import path from 'path';
import { MaterialRequirements } from '@shared/schema';

/**
 * Utility functions for design calculations
 * These are now manual calculations instead of AI-powered analysis
 */

/**
 * Calculate balloon requirements for a design
 * This is a non-AI replacement for the previous analyzeDesignImage function
 */
export function calculateBalloonRequirements(colors: string[], distribution: number[]): MaterialRequirements {
  // Validate parameters
  if (colors.length !== distribution.length) {
    throw new Error('Colors and distribution arrays must have the same length');
  }
  
  const totalBalloons = 100; // Default starting value
  const materialRequirements: MaterialRequirements = {};
  
  // Calculate requirements for each color
  colors.forEach((color, index) => {
    const percentage = distribution[index];
    const colorTotal = Math.floor(totalBalloons * (percentage / 100));
    const small = Math.floor(colorTotal * 0.6); // 60% small balloons
    const large = colorTotal - small; // 40% large balloons
    
    materialRequirements[color.toLowerCase()] = {
      total: colorTotal,
      small,
      large
    };
  });
  
  return materialRequirements;
}

/**
 * Check if an image file exists
 */
export function checkImageExists(imagePath: string): boolean {
  try {
    return fs.existsSync(imagePath);
  } catch (error) {
    console.error('Error checking image path:', error);
    return false;
  }
}

/**
 * Calculate estimated production time based on balloon count
 */
export function calculateProductionTime(totalBalloons: number): string {
  return (totalBalloons / 80).toFixed(1) + ' hrs';
}

/**
 * Calculate estimated clusters based on balloon count
 */
export function calculateClusters(totalBalloons: number): number {
  return Math.ceil(totalBalloons / 20);
}
