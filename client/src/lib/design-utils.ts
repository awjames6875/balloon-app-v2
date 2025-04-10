// This utility file contains functions for design calculations and analysis

interface DesignElement {
  id: string;
  type: string;
  height: number;
  width: number;
  x: number;
  y: number;
  rotation: number;
  svgContent: string;
  colors: string[];
}

interface ColorRequirement {
  small: number;
  large: number;
}

/**
 * Calculates the material requirements (balloons by color and size) for a design
 * @param elements Array of design elements
 * @returns Object with color keys and size counts
 */
export function calculateRequiredMaterials(elements: DesignElement[]): Record<string, ColorRequirement> {
  const balloonCounts: Record<string, ColorRequirement> = {};
  
  elements.forEach(element => {
    // Only process balloon elements
    if (element.type === 'balloon') {
      const size = element.width >= 40 ? 'large' : 'small'; // Determine size based on width
      
      // Process each color in the balloon
      element.colors.forEach(color => {
        if (!color) return; // Skip empty colors
        
        const colorKey = color.toLowerCase();
        
        if (!balloonCounts[colorKey]) {
          balloonCounts[colorKey] = { small: 0, large: 0 };
        }
        
        // Increment the appropriate size count
        if (size === 'small') {
          balloonCounts[colorKey].small += 1;
        } else {
          balloonCounts[colorKey].large += 1;
        }
      });
    }
  });
  
  return balloonCounts;
}

/**
 * Extracts unique colors from a design's elements
 * @param elements Array of design elements
 * @returns Array of unique color strings
 */
export function getUniqueColors(elements: DesignElement[]): string[] {
  const colors = new Set<string>();
  
  elements.forEach(element => {
    if (element.colors && Array.isArray(element.colors)) {
      element.colors.forEach(color => {
        if (color) {
          colors.add(color.toLowerCase());
        }
      });
    }
  });
  
  return Array.from(colors);
}

/**
 * Determines the most prominent colors in a design based on usage frequency
 * @param elements Array of design elements 
 * @param limit Maximum number of colors to return
 * @returns Array of color strings sorted by frequency
 */
export function getProminentColors(elements: DesignElement[], limit = 5): string[] {
  const colorCounts: Record<string, number> = {};
  
  elements.forEach(element => {
    if (element.colors && Array.isArray(element.colors)) {
      element.colors.forEach(color => {
        if (color) {
          const normalizedColor = color.toLowerCase();
          colorCounts[normalizedColor] = (colorCounts[normalizedColor] || 0) + 1;
        }
      });
    }
  });
  
  // Sort colors by frequency and return the top ones
  return Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([color]) => color);
}